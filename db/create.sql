-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `mydb` DEFAULT CHARACTER SET utf8 ;
USE `mydb` ;

-- -----------------------------------------------------
-- Table `mydb`.`platforms`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`platforms` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`games`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`games` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `price` DECIMAL NOT NULL,
  `quantity` INT NOT NULL,
  `description` VARCHAR(500) NOT NULL,
  `release_date` DATE NOT NULL,
  `is_digital` TINYINT NOT NULL,
  `age_category` VARCHAR(10) NOT NULL,
  `platform_id` INT UNSIGNED NOT NULL,
  `image_url` VARCHAR(150) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_games_platforms1_idx` (`platform_id` ASC) VISIBLE,
  CONSTRAINT `fk_games_platforms1`
    FOREIGN KEY (`platform_id`)
    REFERENCES `mydb`.`platforms` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`categories`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`categories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`games_categories`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`games_categories` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `game_id` INT UNSIGNED NOT NULL,
  `category_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_categories_games1_idx` (`game_id` ASC) VISIBLE,
  INDEX `fk_games_categories_categories1_idx` (`category_id` ASC) VISIBLE,
  CONSTRAINT `fk_categories_games1`
    FOREIGN KEY (`game_id`)
    REFERENCES `mydb`.`games` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_games_categories_categories1`
    FOREIGN KEY (`category_id`)
    REFERENCES `mydb`.`categories` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`games_keys`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`games_keys` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `game_id` INT UNSIGNED NOT NULL,
  `used` TINYINT NOT NULL,
  `gkey` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `key_UNIQUE` (`gkey` ASC) VISIBLE,
  INDEX `fk_keys_games1_idx` (`game_id` ASC) VISIBLE,
  CONSTRAINT `fk_keys_games1`
    FOREIGN KEY (`game_id`)
    REFERENCES `mydb`.`games` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(15) NOT NULL,
  `email` VARCHAR(45) NOT NULL,
  `role` VARCHAR(10) NOT NULL,
  `password_hash` VARCHAR(200) NOT NULL,
  `salt` VARCHAR(200) NOT NULL,
  UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE,
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`users_transactions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`users_transactions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `date` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_transactions_users1_idx` (`user_id` ASC) VISIBLE,
  CONSTRAINT `fk_transactions_users1`
    FOREIGN KEY (`user_id`)
    REFERENCES `mydb`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`games_transactions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`games_transactions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_transaction_id` INT NOT NULL,
  `game_id` INT UNSIGNED NOT NULL,
  `key_id` INT UNSIGNED NULL,
  INDEX `fk_games_transactions_transactions1_idx` (`user_transaction_id` ASC) VISIBLE,
  INDEX `fk_games_transactions_games1_idx` (`game_id` ASC) VISIBLE,
  INDEX `fk_games_transactions_keys1_idx` (`key_id` ASC) VISIBLE,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  CONSTRAINT `fk_games_transactions_transactions1`
    FOREIGN KEY (`user_transaction_id`)
    REFERENCES `mydb`.`users_transactions` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_games_transactions_games1`
    FOREIGN KEY (`game_id`)
    REFERENCES `mydb`.`games` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_games_transactions_keys1`
    FOREIGN KEY (`key_id`)
    REFERENCES `mydb`.`games_keys` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

USE `mydb`;

DELIMITER $$
USE `mydb`$$
CREATE DEFINER=root@localhost TRIGGER games_transactions_BEFORE_INSERT BEFORE INSERT ON games_transactions FOR EACH ROW BEGIN
    DECLARE used_key_id integer;
    DECLARE digital tinyint;
    SET digital = (SELECT is_digital FROM games WHERE games.id = new.game_id);
    IF (digital = 1) THEN
        update games_keys set used = 1 where games_keys.id = new.key_id;
      ELSE
        UPDATE games SET quantity = quantity - 1 WHERE games.id = new.game_id;
      END IF;
END$$


DELIMITER ;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
