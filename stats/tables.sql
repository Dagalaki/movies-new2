-- MySQL dump 10.17  Distrib 10.3.17-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: stats
-- ------------------------------------------------------
-- Server version	10.3.17-MariaDB-0+deb10u1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `brands`
--

DROP TABLE IF EXISTS `brands`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `brands` (
  `brand` varchar(16) NOT NULL,
  `cnt` int(10) unsigned NOT NULL,
  PRIMARY KEY (`brand`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `channelpos`
--

DROP TABLE IF EXISTS `channelpos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `channelpos` (
  `pos` smallint(5) unsigned NOT NULL,
  `cnt` int(10) unsigned NOT NULL,
  PRIMARY KEY (`pos`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `compares`
--

DROP TABLE IF EXISTS `compares`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `compares` (
  `ts` int(10) unsigned NOT NULL,
  `v` varchar(2048) DEFAULT NULL,
  `channel` varchar(16) NOT NULL DEFAULT 'rnf',
  PRIMARY KEY (`ts`,`channel`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cpos_brands`
--

DROP TABLE IF EXISTS `cpos_brands`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cpos_brands` (
  `channelpos` smallint(5) unsigned NOT NULL,
  `brand` varchar(16) NOT NULL,
  `cnt` int(10) unsigned NOT NULL,
  PRIMARY KEY (`channelpos`,`brand`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cpos_models`
--

DROP TABLE IF EXISTS `cpos_models`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cpos_models` (
  `channelpos` smallint(5) unsigned NOT NULL,
  `model` varchar(32) NOT NULL,
  `cnt` int(10) unsigned NOT NULL,
  PRIMARY KEY (`channelpos`,`model`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `durations`
--

DROP TABLE IF EXISTS `durations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `durations` (
  `id` int(10) unsigned NOT NULL,
  `ts` int(10) unsigned NOT NULL,
  `end` int(10) unsigned NOT NULL DEFAULT 0,
  `ip` int(10) unsigned NOT NULL DEFAULT 0,
  `channel` varchar(16) NOT NULL,
  PRIMARY KEY (`id`,`ts`,`channel`),
  KEY `ip` (`ip`),
  KEY `channel` (`channel`,`ts`,`end`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1
 PARTITION BY KEY ()
PARTITIONS 16;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `extra`
--

DROP TABLE IF EXISTS `extra`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `extra` (
  `dt` int(10) unsigned NOT NULL,
  `channel` varchar(16) NOT NULL,
  `cookie` int(10) unsigned NOT NULL,
  `ws` int(10) unsigned NOT NULL,
  `ids` int(10) unsigned NOT NULL,
  `new` int(10) unsigned NOT NULL,
  `newStart` int(10) unsigned NOT NULL,
  `tvsgt10` int(10) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`dt`,`channel`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ids`
--

DROP TABLE IF EXISTS `ids`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ids` (
  `dt` int(10) unsigned NOT NULL,
  `data` longtext NOT NULL,
  `channel` varchar(16) NOT NULL,
  `nocookie` longtext NOT NULL,
  PRIMARY KEY (`dt`,`channel`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `infos`
--

DROP TABLE IF EXISTS `infos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `infos` (
  `id` int(10) unsigned NOT NULL,
  `channel` varchar(16) NOT NULL,
  `info` varchar(512) NOT NULL,
  PRIMARY KEY (`id`,`channel`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `logins`
--

DROP TABLE IF EXISTS `logins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `logins` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(32) NOT NULL DEFAULT '',
  `ts` int(10) unsigned NOT NULL DEFAULT 0,
  `ip` int(10) unsigned NOT NULL DEFAULT 0,
  `action` varchar(32) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `models`
--

DROP TABLE IF EXISTS `models`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `models` (
  `model` varchar(32) NOT NULL,
  `cnt` int(10) unsigned NOT NULL,
  `brand` varchar(16) NOT NULL,
  PRIMARY KEY (`model`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `progr`
--

DROP TABLE IF EXISTS `progr`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `progr` (
  `channel` varchar(16) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
  `start` int(10) unsigned NOT NULL DEFAULT 0,
  `title` varchar(256) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
  `descr` text CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
  `end` int(10) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`start`,`channel`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `program`
--

DROP TABLE IF EXISTS `program`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `program` (
  `start` int(10) unsigned NOT NULL,
  `end` int(10) unsigned NOT NULL,
  `title` varchar(256) NOT NULL,
  `dt` int(10) unsigned NOT NULL,
  `duration` int(10) unsigned NOT NULL,
  `count_start` int(10) unsigned NOT NULL DEFAULT 0,
  `count_end` int(10) unsigned NOT NULL DEFAULT 0,
  `cnt` int(10) unsigned NOT NULL DEFAULT 0,
  `customer` varchar(256) NOT NULL DEFAULT '',
  `visited` smallint(5) unsigned NOT NULL DEFAULT 0,
  `vgt1` int(10) unsigned NOT NULL DEFAULT 0,
  `avg_duration` int(10) unsigned NOT NULL DEFAULT 0,
  `zero` int(10) unsigned NOT NULL DEFAULT 0,
  `descr` text NOT NULL,
  PRIMARY KEY (`start`),
  KEY `dt` (`dt`),
  KEY `start` (`start`,`end`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `test`
--

DROP TABLE IF EXISTS `test`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `test` (
  `id` int(10) unsigned NOT NULL,
  `pos` smallint(5) unsigned NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `total_new`
--

DROP TABLE IF EXISTS `total_new`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `total_new` (
  `dt` int(10) unsigned NOT NULL,
  `channel` varchar(16) NOT NULL,
  `new` mediumint(8) unsigned NOT NULL,
  PRIMARY KEY (`dt`,`channel`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `unique_ids`
--

DROP TABLE IF EXISTS `unique_ids`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `unique_ids` (
  `data` longtext NOT NULL,
  `channel` varchar(16) NOT NULL,
  PRIMARY KEY (`channel`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `username` varchar(32) NOT NULL,
  `pass` varchar(128) NOT NULL,
  `ts` int(10) unsigned NOT NULL DEFAULT unix_timestamp(),
  PRIMARY KEY (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `videosreq`
--

DROP TABLE IF EXISTS `videosreq`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `videosreq` (
  `ts` int(10) unsigned NOT NULL,
  `referrer` text NOT NULL,
  `agent` text NOT NULL,
  PRIMARY KEY (`ts`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-03-09 13:20:24
