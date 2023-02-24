const teamsMenu = $('#teamSelect');
const teamDisplay = $('#roster');
const yearMenu = $('#yearSelect');
const fetchObj = { 
    method: 'GET',
    headers: { 'Content-Type': 'application/json'}
}

init();


function init() {
    const year = new Date().getUTCFullYear() - 1;
    buildTeamMenu(year);
    buildYearMenu()
    teamsMenu.on('change', (e) => {
        e.preventDefault();
        const id = e.target.value;
        buildRoster(id, yearMenu.val());
    })
    yearMenu.on('change', (e) => {
        e.preventDefault();
        const year = e.target.value;
        teamDisplay.empty();
        buildTeamMenu(year);
    })
}

async function buildTeamMenu(year) {
    const current = teamsMenu.val();
    teamsMenu.empty();
    const optElem = $('<option>');
    optElem.text("Select a team");
    optElem.val("0");
    teamsMenu.append(optElem);
    const teams = await getTeams(year);
    populateTeamMenu(teams, current);
}

function buildYearMenu() {
    for (i = 2022; i >= 1969; i--) {
        const optElem = $('<option>')
        if(i==2022) optElem.attr('selected', true);
        optElem.text(i);
        optElem.val(i);
        yearMenu.append(optElem);
    }
}

async function buildRoster(id, year) {
    console.log(id, year);
    teamDisplay.empty();
    const rawPlayers = await getRoster(id, year);
    const players = [];
    for (const [key, player] of Object.entries(rawPlayers)) {
        players.push(player);
    }
    players.sort(sortRoster);
    for (player of players) {
        const newRow = $('<tr>');
        const newPos = $('<td>');
        const newNum = $('<td>');
        const newName = $('<td>');
        newPos.text(`${player.primary_position}`)
        newNum.text(`${player.jersey_number}`)
        newName.text(`${player.name_first_last}`)
        newRow.append(newPos);
        newRow.append(newNum);
        newRow.append(newName);
        teamDisplay.append(newRow);
    }
    return true;
}

async function getTeams(year) {
    const url = `http://lookup-service-prod.mlb.com/json/named.team_all_season.bam?sport_code='mlb'&all_star_sw='N'&sort_order=name_asc&season='${year}'&team_all_season.col_in=team_id,mlb_org`;

    const teams = await fetch(url, fetchObj);
    const data = await teams.json();
    return data.team_all_season.queryResults.row;
}

async function getRoster(teamId, year = (new Date().getUTCFullYear() - 1)) {
    const url = `http://lookup-service-prod.mlb.com/json/named.roster_team_alltime.bam?start_season='${year}'&end_season='${year}'&team_id='${teamId}'&roster_team_alltime.col_in=player_id,name_first_last,jersey_number,name_sort,primary_position`;

    const roster = await fetch(url, fetchObj);
    const data = await roster.json();
    return data.roster_team_alltime.queryResults.row;
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
    if (getTeam) buildRoster(selected, yearMenu.val());
}

function sortRoster(a,b) {
    const order=["P", "C", "1B", "2B", "3B", "SS", "IF", "LF", "CF", "RF", "OF", "DH", "PH"];
    if (a.primary_position == b.primary_position) {
        return (parseInt(a.jersey_number) - parseInt(b.jersey_number))
    }
    else return (order.indexOf(a.primary_position) - order.indexOf(b.primary_position))
    // aIsP = a.primary_position == "P";
    // bIsP = b.primary_position == "P";
    // aIsC = a.primary_position == "C";
    // bIsC = b.primary_position == "C";
    // aNum = parseInt(a.jersey_number);
    // bNum = parseInt(b.jersey_number);
    // if (aIsP && !bIsP) return -1
    // else if (aIsP && bIsP) return (aNum - bNum)
    // else if (aIsC && !bIsC) return -1
    // else if (aIsC && !bIsC) return (aNum - bNum)
    // else return 0;
    
}