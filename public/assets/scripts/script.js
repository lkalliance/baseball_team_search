const teamsMenu = $('#teamSelect');
const teamDisplay = $('#roster');
const yearMenu = $('#yearSelect');
const searchBtn = $('#searchButton');
const teamTitle = $('#teamTitle');
const getObj = { 
    method: 'GET',
    headers: { 'Content-Type': 'application/json'}
};
const postObj = { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json'}
};

const user = 1;

const abbrev = {
    109: "ARI",
    144: "BS1",
    110: "MLA",
    111: "BOS",
    112: "CH2",
    145: "CHA",
    113: "CN2",
    114: "CLE",
    115: "COL",
    116: "DET",
    117: "HOU",
    118: "KCA",
    108: "LAA",
    119: "BR3",
    146: "FLO",
    158: "SE1",
    142: "WS1",
    121: "NYN",
    147: "BLA",
    133: "PHA",
    143: "WOR",
    134: "PIT",
    135: "SDN",
    137: "TRN",
    136: "SEA",
    138: "SL4",
    139: "TBA",
    140: "WS2",
    141: "TOR",
    120: "MON"
}

init();


function init() {
    const year = new Date().getUTCFullYear() - 1;
    buildTeamMenu(year);
    buildYearMenu()
    searchBtn.on('click', (e) => {
        e.preventDefault();
        buildRoster(teamsMenu.val(), yearMenu.val());
    })
    yearMenu.on('change', (e) => {
        e.preventDefault();
        const year = e.target.value;
        buildTeamMenu(year);
    })
    // teamDisplay.on('click', 'button', (e) => {
    //     e.preventDefault();
    //     addCard(e.target.parentNode.dataset.player, yearMenu.val(), user)
    // })
}

async function buildTeamMenu(year) {
    const current = teamsMenu.val();
    teamsMenu.empty();
    const defElem = $('<option>');
    defElem.text('----------');
    defElem.val('0');
    teamsMenu.append(defElem);
    const teams = await getTeams(year);
    populateTeamMenu(teams, current);
}

function buildYearMenu() {
    for (i = 2022; i >= 1920; i--) {
        const optElem = $('<option>')
        optElem.text(i);
        optElem.val(i);
        yearMenu.append(optElem);
    }
}

async function buildRoster(id, year) {
    if((id == "0" || year == "0")) return false;
    
    teamDisplay.empty();
    const cardList = await(getCardList(id, year, user));
    console.log(cardList);
    teamTitle.text($('#teamSelect option:selected').text());
    teamTitle.removeClass();
    teamTitle.addClass(`${abbrev[id]} primary`);
    const yearSpan = $('<span>');
    yearSpan.addClass(`${abbrev[id]} secondary`);
    yearSpan.text(` ${year}`);
    teamTitle.append(yearSpan);
    const rawPlayers = await getRoster(id, year);
    const players = [];
    for (const [key, player] of Object.entries(rawPlayers)) {
        players.push(player);
    }
    const teamRoster = divideRoster(players);
    for (section of teamRoster) {
        section.players.sort(sortRoster);
        const headerRow = $('<tr>');
        const sectionCell = $('<td>');
        sectionCell.addClass('roster-section');
        sectionCell.attr('colspan', '4');
        sectionCell.text(section.section);
        headerRow.append(sectionCell);
        teamDisplay.append(headerRow);

        for (player of section.players) {
            console.log(player);
            const newRow = $('<tr>');
            const newPos = $('<td>');
            const newNum = $('<td>');
            const newName = $('<td>');
            newPos.text(`${player.primary_position}`)
            newNum.text(`${player.jersey_number}`)
            newName.text(`${player.name_first_last}`)
            newName.attr('data-player', player.player_id);
            let newBtn = false;
            if (cardList.indexOf(parseInt(player.player_id)) >=0 ) {
                newRow.addClass("have-card");
            } else {
                newBtn = $('<button>');
                newBtn.text("ADD");
                newBtn.addClass("btn btn-outline-success btn-sm");
                newBtn.attr('data-idnum', player.player_id)
                newBtn.attr('data-name', player.name_first_last)
                newBtn.attr('data-sort', player.name_sort)
                newName.append(newBtn);
            }
            newRow.append(newPos);
            newRow.append(newNum);
            newRow.append(newName);
            teamDisplay.append(newRow);

            if (newBtn) {
                newBtn.on('click', (e) => {
                    e.preventDefault();
                    collectCard( e.target.dataset.idnum, e.target.dataset.name, e.target.dataset.sort, yearMenu.val(), teamsMenu.val(), $('#teamSelect option:selected').text(), 1, user );
                })
            }
        }
    }

    function sortRoster(a,b) {
        const order=["P", "C", "1B", "2B", "3B", "SS", "IF", "LF", "CF", "RF", "OF", "DH", "PH"];
        if (cardList.indexOf(parseInt(a.player_id)) >= 0) {
            return -1;
        } else if (cardList.indexOf(parseInt(b.player_id)) >= 0) {
            return 1;
        } else if (a.primary_position == b.primary_position) {
            return (a.name_sort - b.name_sort);
        } else return (order.indexOf(a.primary_position) - order.indexOf(b.primary_position))
    }
    
    return true;
}

async function getTeams(year) {
    const url = `http://lookup-service-prod.mlb.com/json/named.team_all_season.bam?sport_code='mlb'&all_star_sw='N'&sort_order=name_asc&season='${year}'&team_all_season.col_in=team_id,mlb_org,franchise_code`;

    const teams = await fetch(url, getObj);
    const data = await teams.json();
    return data.team_all_season.queryResults.row;
}

async function getRoster(teamId, year = (new Date().getUTCFullYear() - 1)) {
    const url = `http://lookup-service-prod.mlb.com/json/named.roster_team_alltime.bam?start_season='${year}'&end_season='${year}'&team_id='${teamId}'&roster_team_alltime.col_in=player_id,name_first_last,jersey_number,name_sort,primary_position`;

    const data = await fetch(url, getObj);
    const roster = await data.json();
    return roster.roster_team_alltime.queryResults.row;
}

async function getCardList(team, year, user) {
    const url = `http://localhost:3001/api/team/${team}/${year}/${user}`

    const data = await fetch(url, getObj);
    const cards = await data.json();
    return cards;
}

async function collectCard(playerId, playerName, playerSort, year, teamId, teamName, type, uid) {
    const url = 'http://localhost:3001/api/card/add';
    postObj.body = JSON.stringify({
        playerId: playerId,
        playerName: playerName,
        playerSort: playerSort,
        year: year,
        team: teamId,
        teamName: teamName,
        teamAbbrev: abbrev[teamId],
        type: type,
        uid: user
    });

    const data = await fetch(url, postObj);
    const addition = await data.json();
    
    buildRoster(teamId, year);
}

function populateTeamMenu(teams, selected) {
    let getTeam = false;
    for(team of teams) {
        const optElem = $('<option>');
        optElem.text(team.mlb_org);
        optElem.val(team.team_id);
        teamsMenu.append(optElem);
        if(team.team_id == selected) {
            optElem.attr("selected", true);
            getTeam = true;
        }
    }
}



function divideRoster(roster) {
    const pitchers = {
        section: "Pitchers",
        players: []
    };
    const catchers = {
        section: "Catchers",
        players: []
    };
    const infield = {
        section: "Infield",
        players: []
    };
    const outfield = {
        section: "Outfield",
        players: []
    };
    const others = {
        section: "Others",
        players: []
    };

    for (player of roster) {
        const position = player.primary_position;
        switch (player.primary_position) {
            case "P":
                pitchers.players.push(player);
                break;
            case "C":
                catchers.players.push(player);
                break;
            case "1B":
                infield.players.push(player);
                break;
            case "2B":
                infield.players.push(player);
                break;
            case "SS":
                infield.players.push(player);
                break;
            case "3B":
                infield.players.push(player);
                break;
            case "IF":
                infield.players.push(player);
                break;
            case "LF":
                outfield.players.push(player);
                break;
            case "CF":
                outfield.players.push(player);
                break;
            case "RF":
                outfield.players.push(player);
                break;
            case "OF":
                outfield.players.push(player);
                break;
            default:
                others.players.push(player);
                                             
        }        
    }
    return [pitchers, catchers, infield, outfield, others];
}