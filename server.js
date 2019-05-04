require('dotenv').config()
const express = require('express');
const path = require('path');
const { Kayn, REGIONS } = require('kayn');

const app = express();
const kayn = Kayn(process.env.RIOT_API_KEY)();

const processMatch = (championIdMap, items, summonerSpells, summonerId, match) => {

  const { participantId, player } = match.participantIdentities.find(
      pi => pi.player.summonerId === summonerId,
  )
  const {championId, stats, spell1Id, spell2Id} = match.participants.find(
      p => p.participantId === participantId,
  )

  // extract summonerSpells
  const selectedSummonerSpells = ['N/A', 'N/A'];
  Object.values(summonerSpells).forEach(spell => {
    if (spell.key === spell1Id.toString()) selectedSummonerSpells[0] = spell.name;
    if (spell.key === spell2Id.toString()) selectedSummonerSpells[1] = spell.name;
  })

  // extract bought items
  const boughtItems = [
    items[stats.item0] && items[stats.item0].name, 
    items[stats.item1] && items[stats.item1].name, 
    items[stats.item2] && items[stats.item2].name,
    items[stats.item3] && items[stats.item3].name,
    items[stats.item4] && items[stats.item4].name,
    items[stats.item5] && items[stats.item5].name,
  ];

  //extract gameDuration and also the human-readable form
  const gameDurationInMinutes = (match.gameDuration/60);
  const minutesOnly = gameDurationInMinutes.toFixed(0);
  const remainderSeconds = (match.gameDuration % 60);

  const champion = championIdMap.data[championId]

  return {
      gameId: match.gameId,
      didWin: stats.win,
      gameDuration: `${minutesOnly}m ${remainderSeconds}s`,
      summonerName: player.summonerName,
      summonerSpells: selectedSummonerSpells,
      //perks
      kills: stats.kills,
      deaths: stats.deaths,
      assists: stats.assists,
      championName: champion.name,
      boughtItems,
      championLevel: stats.champLevel,
      creepScore: stats.totalMinionsKilled,
      creepPerMin: (stats.totalMinionsKilled / gameDurationInMinutes).toFixed(1)
  }
}

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/api/matchHistory', async (req, res) => {
  
  try {
    const { id: summonerId , accountId } = await kayn.Summoner.by.name(req.query.username);
    const { matches } = await kayn.Matchlist.by
          .accountID(accountId);
    const gameIds = matches.slice(0, 10).map(({ gameId }) => gameId);
    const matchDetails = await Promise.all(gameIds.map(kayn.Match.get));

    const championIdMap = await kayn.DDragon.Champion.listDataByIdWithParentAsId();
    const { data: items }  =  await kayn.DDragon.Item.list();
    const { data: summonerSpells } = await kayn.DDragon.SummonerSpell.list();
    //const perks  = await kayn.DDragon.RunesReforged.list(); bugged?

    const results = await Promise.all(matchDetails.map(
      match => processMatch(championIdMap, items, summonerSpells, summonerId, match)
    ));

    const newRes = {
      matches,
      matchDetails,
      items,
      results
    }

    res.json(newRes);

    console.log('------');
  }
  catch(err) {
    switch (err.statusCode) {
      case 404:  {
        res.statusMessage = 'Summoner Not Found';
        res.sendStatus(404);
      }
    }
    console.log(err);
  }
  
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log(`listening on ${port}`);