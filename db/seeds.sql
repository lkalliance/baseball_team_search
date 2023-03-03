INSERT INTO types (tid, company)
VALUES  (1, "Topps"),
        (2, "Fleer"),
        (3, "Donruss");

INSERT INTO users (uid, username, password)
VALUES  (1, "Lee", "leepwd"),
        (2, "Adam", "adampwd");

INSERT INTO cards (cid, type, player_name, player_name_sort, player_mlb_id, year, team, team_abbrev, team_mlb_id)
VALUES  (1, 1, "Reggie Jackson", "Jackson, Reggie", 124, 1969, "Oakland Athletics", "OAK", 155),
        (2, 1, "Willie Randolph", "Randolph, Willie", 256, 1979, "New York Yankees", "NYA", 101),
        (3, 1, "Harmon Killebrew", "Killebrew, Harmon", 337, 1964, "Minnesota Twins", "WS1", 112),
        (4, 2, "Jose Canseco", "Canseco, Jose", 946, 1985, "Oakland Athletics", "OAK", 155),
        (5, 1, "Gus Bell", "Bell, Gus", 437, 1967, "Cincinnati Reds", "CIN", 124);

INSERT INTO cards_x_user (cxu_id, user, card)
VALUES  (1, 1, 1),
        (2, 2, 4),
        (3, 2, 5),
        (4, 1, 3),
        (5, 2, 2);