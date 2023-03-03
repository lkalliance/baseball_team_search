DROP DATABASE IF EXISTS bb_card_db;
CREATE DATABASE bb_card_db;

USE bb_card_db;

CREATE TABLE users (
  uid INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(30) NOT NULL,
  password VARCHAR(15) NOT NULL
);

CREATE TABLE types (
  tid INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  company VARCHAR(20),
  series VARCHAR(30)
);

CREATE TABLE cards (
  cid INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  type INT,
  player_name VARCHAR(40),
  player_name_sort VARCHAR(40),
  player_mlb_id INT,
  year INT,
  team VARCHAR(30),
  team_abbrev VARCHAR(3),
  team_mlb_id INT,
  FOREIGN KEY (type)
  REFERENCES types(tid)
  ON DELETE SET NULL
);

CREATE TABLE user_lists (
  lid INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user INT,
  list_name VARCHAR(30),
  FOREIGN KEY (user)
  REFERENCES users(uid)
  ON DELETE SET NULL
);

CREATE TABLE cards_x_user (
  cxu_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user INT,
  card INT,
  FOREIGN KEY (user)
  REFERENCES users(uid)
  ON DELETE SET NULL,
  FOREIGN KEY (card)
  REFERENCES cards(cid)
  ON DELETE SET NULL
);

CREATE TABLE cards_x_list (
  cxl_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  card INT,
  list INT,
  FOREIGN KEY (card)
  REFERENCES cards(cid)
  ON DELETE SET NULL,
  FOREIGN KEY (list)
  REFERENCES user_lists(lid)
  ON DELETE SET NULL
);
