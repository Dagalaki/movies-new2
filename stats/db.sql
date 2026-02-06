-- MySQL dump 10.17  Distrib 10.3.17-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: stats_action
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
-- Dumping data for table `brands`
--

LOCK TABLES `brands` WRITE;
/*!40000 ALTER TABLE `brands` DISABLE KEYS */;
/*!40000 ALTER TABLE `brands` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `channelpos`
--

LOCK TABLES `channelpos` WRITE;
/*!40000 ALTER TABLE `channelpos` DISABLE KEYS */;
/*!40000 ALTER TABLE `channelpos` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `compares`
--

LOCK TABLES `compares` WRITE;
/*!40000 ALTER TABLE `compares` DISABLE KEYS */;
INSERT INTO `compares` VALUES (1678750200,'161,149,145,142,137,133,131,131,130,130,130,127,126,125,124,120,117,116,99,97,93,88,87,84,83,82,80,79,77,77,75,75,73,72,71,69,68,67,67,67,66,65,65,65,65,62,62,57,56,55,53,51,49,49,49,48,48,47,47,47,47','rnf'),(1678753800,'63,60,58,58,57,57,57,57,56,54,53,52,50,49,49,48,47,47,46,45,43,43,42,40,39,39,39,39,38,37,35','rnf'),(1678755600,'49,46,46,43,42,42,42,42,42,42,42,40,40,40,40,40,40,40,38,37,36,36,35,35,35,35,35,35,34,34,34,34,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,31,30,30,29,27,26,26,25,25,25,25,25,23,23','rnf'),(1678759200,'55,53,52,49,48,46,46,46,46,46,45,45,44,44,44,44,44,44,43,42,42,41,41,41,40,39,39,39,38,38,37,37,36,36,36,34,33,33,33,33,33,33,33,33,33,32,32,32,32,32,32,30,30,30,30,30,30,30,30,28,28','rnf'),(1678762800,'39,32,32,29,28,28,28,28,28,28,28,28,28,28,27,26,26,26,25,25,24,24,24,24,23,22,22,21,21,21,20,20,20,20,20,20,20,20,20,20,19,18,18,18,18,18,18,18,18,18,18,18,17,17,17,17,16,16,16,16,16','rnf'),(1678766400,'18,16,15,15,15,15,15,15,15,15,15,15,15,15,14,14,14,13,13,13,13,13,13,12,12,12,12,12,12,12,12,12,11,11,11,11,11,11,10,10,10,10,10,10,10,10,10,10,10,10,9,8,8,7,6,6,6,6,6,6,5','rnf'),(1678770000,'21,16,14,14,13,11,10,10,10,10,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,8,8,7,7,7,7,6,6,6,6,6,6,6,6,6,6,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5','rnf'),(1678773600,'14,9,8,8,7,7,7,6,6,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3','rnf'),(1678777200,'42,39,39,38,38,36,35,34,34,33,32,32,29,29,29,28,27,25,22,22,21,21,21,21,21,20,19,18,18,17,17,17,17,17,17,17,16,13,13,13,13,12,12,12,12,11,11,11,11,11,11,11,11,11,10,10,10,10,10,10,10,9,9,9,9,8,8,8,8,8,8,7,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6','rnf'),(1678782600,'41,37,36,35,35,35,34,34,33,31,30,30,30,28,27,27,26,25,24,23,23,23,23,23,22,21,21,21,21,19,19','rnf'),(1678784400,'55,50,46,42,41,40,38,38,38,38,38,36,35,30,28,26,25,25,24,23,23,23,22,22,22,22,22,22,21,21,21,21,21,21,21,21,21,21,20,20,20,20,20,19,19,19,19,19,19,18,18,18,17,17,16,16,16,16,16,16,16','rnf'),(1678788000,'102,95,91,87,86,81,80,80,78,78,78,76,76,76,73,72,72,70,69,69,69,68,66,66,66,64,61,60,57,54,53,50,49,48,47,47,46,46,46,46,46,46,43,43,42,42,42,42,42,41,41,41,41,40,40,39,39,39,38,38,38,38,38,35,35,35,35,34,33,33,32,31,31,31,31,31,29,28,28,28,28,27,27,27,27,26,25,25,24,24,24','rnf'),(1678793400,'451,430,425,413,403,398,391,337,334,327,320,313,310,309,307,307,305,303,298,292,287,286,279,272,269,267,264,261,206,137,120,105,96,86,79,75,69,64,63,59,55,55,53,48,46,46,45,43,40,39,37,36,35,34,33,33,33,33,32,31,31,30,29,29,29,29,29,28,28,28,28,28,27,27,27,27,26,24,23,23,21,18,18,17,17,14,13,12,12,12,12','rnf'),(1678798800,'64,48,44,41,40,40,37,36,36,34,33,31,31,29,28,27,27,27,27,27,25,25,25,25,24,23,21,19,17,16,15,15,14,14,14,14,13,13,13,13,12,12,11,11,11,11,11,11,11,11,10,10,10,10,10,10,10,10,10,10,10','rnf'),(1678802400,'42,30,25,24,22,20,19,19,18,18,16,15,15,14,14,14,13,13,12,12,12,11,11,11,11,11','rnf'),(1678803900,'44,27,25,22,22,22,19,18,18,16,15,15,15,15,14,13,13,11,11,11,11,11,11,11,11,11,11,11,11,11,11,10,9,9,9,9','rnf'),(1678806000,'31,26,26,24,19,19,18,17,17,16,15,14,14,14,14,14,14,14,13,12,10,10,10,10,9,9,9,7,7,7,7,7,7,7,7,6,6,6,6,6,6,6,6,6,6,6,5,5,5,5,5,3,3,3,3,3,3,3,3,3,3','rnf'),(1678809600,'44,25,23,22,22,20,19,18,18,18,18,17,17,17,17,17,16,16,15,15,15,15,14,14,13,13,13,13,13,12,12,12,12,12,12,12,12,12,11,11,11,11,11,11,11,11,11,10,10,10,10,10,9,9,8,7,7,7,6,6,5','rnf'),(1678813200,'92,85,84,83,80,79,78,73,71,71,69,67,65,65,64,64,64,63,62,62,62,62,62,61,59,58,58,58,56,55,55,54,53,53,53,53,52,51,51,49,49,49,49,49,49,49,49,49,48,48,48,47,47,47,47,47,47,46,45,45,44,44,41,41,40,40,40,40,39,39,37,37,35,34,34,33','rnf'),(1678817700,'877,847,834,818,808,797,792,782,778,771,765,758,750,739,731,726,721,719,716,711,707,701,696,689,678,672,660,654,648,516,334,275,245,230,221,204,180,169,163,152,146,142,139,135,130,121,116,108,99,95,93,91,88,85,81,78,76,75,70,70,68,67,64,61,61,57,57,56,55,54,53,53,53,53,52,51,51,47,47,47,46,45,45,45,44,44,43,42,41,40,39,39,39,39,39,39','rnf'),(1678823400,'470,431,421,413,407,399,390,378,368,359,354,343,338,329,324,312,307,286,278,270,258,254,248,247,243,237,232,230,229,227,221,218,215,210,209,204,200,198,198,196,191,187,185,184,180,176,173,158,148,141,139,134,133,130,128,126','rnf'),(1678826700,'1129,1019,957,909,877,850','rnf'),(1678827000,'1222,1104,1004,928,879,856,841,820,802,776,759,744,730,718,705,684,674,664,650,616,493,463,447,432,420,407,403,397,391,381,377,371,366,364,361,359,355,353,349,341,338,253,199,171,156,145,138,134,129,126,124,119,116,114,110,108,105,101,98,95,93,92,90,88,80,80,74,72,70,70,68,66,64,61,57,57,56,55,54,52,49,47,46,46,44,42,40,39,38,36,36,33,32,31,31,31,30,30,26,22,20','rnf'),(1678833000,'85,71,65,60,57,49,48,43,40,39,35,35,33,31,27,23,21,20,16,13,11,10,9,9,8,7,6,5,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0','rnf');
/*!40000 ALTER TABLE `compares` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `cpos_brands`
--

LOCK TABLES `cpos_brands` WRITE;
/*!40000 ALTER TABLE `cpos_brands` DISABLE KEYS */;
/*!40000 ALTER TABLE `cpos_brands` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `cpos_models`
--

LOCK TABLES `cpos_models` WRITE;
/*!40000 ALTER TABLE `cpos_models` DISABLE KEYS */;
/*!40000 ALTER TABLE `cpos_models` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `durations`
--

LOCK TABLES `durations` WRITE;
/*!40000 ALTER TABLE `durations` DISABLE KEYS */;
/*!40000 ALTER TABLE `durations` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `extra`
--

LOCK TABLES `extra` WRITE;
/*!40000 ALTER TABLE `extra` DISABLE KEYS */;
/*!40000 ALTER TABLE `extra` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ids`
--

LOCK TABLES `ids` WRITE;
/*!40000 ALTER TABLE `ids` DISABLE KEYS */;
/*!40000 ALTER TABLE `ids` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `infos`
--

LOCK TABLES `infos` WRITE;
/*!40000 ALTER TABLE `infos` DISABLE KEYS */;
/*!40000 ALTER TABLE `infos` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `logins`
--

LOCK TABLES `logins` WRITE;
/*!40000 ALTER TABLE `logins` DISABLE KEYS */;
/*!40000 ALTER TABLE `logins` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `models`
--

LOCK TABLES `models` WRITE;
/*!40000 ALTER TABLE `models` DISABLE KEYS */;
/*!40000 ALTER TABLE `models` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `progr`
--

LOCK TABLES `progr` WRITE;
/*!40000 ALTER TABLE `progr` DISABLE KEYS */;
/*!40000 ALTER TABLE `progr` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `program`
--

LOCK TABLES `program` WRITE;
/*!40000 ALTER TABLE `program` DISABLE KEYS */;
INSERT INTO `program` VALUES (1678665600,1678669200,'Κρητικοί Χοροί Και Τραγούδια',20230313,3600,0,0,0,'',0,0,0,0,'Ψυχαγωγική εκπομπή για τους φίλους της Κρήτης'),(1678669200,1678672800,'Προσωπικά Δεδομένα',20230313,3600,0,0,0,'',0,0,0,0,'Ο Κώστας Μαρδάς ανακρίνει Ακαδημαϊκούς, Στρατιωτικούς, Καθηγητές Πανεπιστημίων, Συγγραφείς, Καλλιτέχνες και άλλους κορυφαίους της κοινωνικής ζωής'),(1678672800,1678674600,'Δελτίο Ειδήσεων',20230313,1800,0,0,0,'',0,0,0,0,'Οι ειδήσεις της ημέρας με την Λίνα Κλείτου'),(1678674600,1678676400,'Γνωρίζοντας Την Ελλάδα Μας',20230313,1800,0,0,0,'',0,0,0,0,'Τουριστικό ντοκυμαντέρ για διάφορα μέρη της χώρας μας'),(1678676400,1678680000,'Πολιτιστικό Ημερολόγιο',20230313,3600,0,0,0,'',0,0,0,0,'Πολιτιστική περιήγηση σε διάφορα μέρη της πατρίδας μας'),(1678680000,1678683600,'ΕΚΠΟΜΠΕΣ ΤΗΛΕΟΠΤΙΚΩΝ ΑΓΟΡΩΝ',20230313,3600,0,0,0,'',0,0,0,0,' '),(1678683600,1678687200,'Δελτίο Ειδήσεων',20230313,3600,0,0,0,'',0,0,0,0,'Οι ειδήσεις της ημέρας με την Λίνα Κλείτου'),(1678687200,1678690800,'Ραντεβού Με Την Επικαιρότητα',20230313,3600,0,0,0,'',0,0,0,0,'Σχολιασμός της επικαιρότητας και ανοιχτή επικοινωνία με τους τηλεθεατές'),(1678690800,1678696200,'Αντιπαραθέσεις',20230313,5400,0,0,0,'',0,0,0,0,'Ενημερωτική εκπομπή του Κώστα Χαρδαβέλλα με καλεσμένους ειδικούς σε θέαμτα υγείας, εργασίας, ασφάλισης, σύνταξης κλπ'),(1678696200,1678698000,'ΕΚΠΟΜΠΕΣ ΤΗΛΕΟΠΤΙΚΩΝ ΑΓΟΡΩΝ',20230313,1800,0,0,0,'',0,0,0,0,' '),(1678698000,1678701600,'Νανοτεχνολογία & Υγεία',20230313,3600,0,0,0,'',0,0,0,0,'Ιατρικά θέματα'),(1678701600,1678707000,'Fashion Time',20230313,5400,0,0,0,'',0,0,0,0,'Γυναικεία μόδα'),(1678707000,1678712400,'O Τρελλός Της Πλατείας Αγάμων',20230313,5400,0,0,0,'',0,0,0,0,'Ένας ανύπαντρος δικηγόρος ορκισμένος εχθρός του γάμου, κατοικεί πού αλλού; Στην πλατεία Αγάμων. Ο θείος του από το εξωτερικό  και η σπιτονοικοκυρά του θέλουν να παντρευτεί, για να κληρονομήσει τον θείο του. Ο δικηγόρος στήνει έναν λευκό γάμο…'),(1678712400,1678716000,'Ραντεβού Με Την Επικαιρότητα',20230313,3600,0,0,0,'',0,0,0,0,''),(1678716000,1678717500,'Μεσημβρινό Δελτίο Ειδήσεων',20230313,1500,0,0,0,'',0,0,0,0,'Ειδήσεις με τον Βαγγέλη Σαρρή'),(1678717500,1678719600,'ΕΚΠΟΜΠΕΣ ΤΗΛΕΟΠΤΙΚΩΝ ΑΓΟΡΩΝ',20230313,2100,0,0,0,'',0,0,0,0,''),(1678719600,1678723200,'Jubilee',20230313,3600,0,0,0,'',0,0,0,0,'Χειροποίητα κοσμήματα από φυσικές πέτρες'),(1678723200,1678726800,'Προσωπικά Δεδομένα',20230313,3600,0,0,0,'',0,0,0,0,'Ο Κώστας Μαρδάς ανακρίνει Ακαδημαϊκούς, Στρατιωτικούς, Καθηγητές Πανεπιστημίων, Συγγραφείς, Καλλιτέχνες και άλλους κορυφαίους της κοινωνικής ζωής'),(1678726800,1678731300,'Αστυνομία Και Κοινωνία',20230313,4500,0,0,0,'',0,0,0,0,'Κλαδικά θέματα στελεχών της Ελληνικής Αστυνομίας'),(1678731300,1678737000,'Καρδιές Που Ξέρουν Να Αγαπούν ',20230313,5700,0,0,0,'',0,0,0,0,'Μια πλούσια κοπέλα αγαπάει ένα φοιτητή ιατρικής, κάνουν όνειρα για να παντρευτούν. Η οικογένεια της κοπέλας έχει άλλα όνειρα'),(1678737000,1678740000,'Κεντρικό Δελτίο Ειδήσεων',20230313,3000,0,0,0,'',0,0,0,0,'Οι ειδήσεις της ημέρας με την Λίνα Κλείτου'),(1678740000,1678740600,'Ο Καιρός',20230313,600,0,0,0,'',0,0,0,0,'Πρόβλεψη καιρού'),(1678740600,1678746600,'Παρεμβάσεις',20230313,6000,0,0,0,'',0,0,0,0,'Ανοιχτή πολιτική συζήτηση με πολιτικούς όλων των παρατάξεων. Με τον Σωτήρη Ξενάκη και τον Νίκο Ελευθερόγλου'),(1678746600,1678750200,'Στην Αρένα Της Ζωής',20230313,3600,0,0,0,'',0,0,0,0,'Συνεντεύξεις του Κώστα Χαρδαβέλλα με ανθρώπους της τέχνης, του πολιτισμού και του αθλητισμού'),(1678750200,1678753800,'Ραντεβού Με Την Επικαιρότητα',20230314,3600,161,47,1840,'',0,304,302,37,'Σχολιασμός της επικαιρότητας και ανοιχτή επικοινωνία με τους τηλεθεατές'),(1678753800,1678755600,'ΕΚΠΟΜΠΕΣ ΤΗΛΕΟΠΤΙΚΩΝ ΑΓΟΡΩΝ',20230314,1800,63,35,533,'',0,67,258,20,' '),(1678755600,1678759200,'Κρητικοί Χοροί Και Τραγούδια',20230314,3600,49,23,814,'',0,220,445,16,'Ψυχαγωγική εκπομπή για τους φίλους της Κρήτης'),(1678759200,1678762800,'Δελτίο Ειδήσεων',20230314,3600,55,28,742,'',0,100,298,13,'Οι ειδήσεις της ημέρας με την Λίνα Κλείτου'),(1678762800,1678766400,'Πολιτιστικό Ημερολόγιο',20230314,3600,39,16,660,'',0,48,212,24,'Πολιτιστική περιήγηση σε διάφορα μέρη της πατρίδας μας'),(1678766400,1678770000,'ΕΚΠΟΜΠΕΣ ΤΗΛΕΟΠΤΙΚΩΝ ΑΓΟΡΩΝ',20230314,3600,18,5,925,'',0,140,158,32,' '),(1678770000,1678773600,'Δελτίο Ειδήσεων',20230314,3600,21,5,1285,'',0,172,107,47,'Οι ειδήσεις της ημέρας με την Λίνα Κλείτου'),(1678773600,1678777200,'Ραντεβού Με Την Επικαιρότητα',20230314,3600,14,3,1336,'',0,217,164,61,'Σχολιασμός της επικαιρότητας και ανοιχτή επικοινωνία με τους τηλεθεατές'),(1678777200,1678782600,'Παρεμβάσεις',20230314,5400,42,6,2179,'',0,256,150,78,'Ανοιχτή πολιτική συζήτηση με πολιτικούς όλων των παρατάξεων. Με τον Σωτήρη Ξενάκη και τον Νίκο Ελευθερόγλου'),(1678782600,1678784400,'ΕΚΠΟΜΠΕΣ ΤΗΛΕΟΠΤΙΚΩΝ ΑΓΟΡΩΝ',20230314,1800,41,19,744,'',0,116,193,29,' '),(1678784400,1678788000,'Νανοτεχνολογία & Υγεία',20230314,3600,55,16,1733,'',0,303,260,63,'Ιατρικά θέματα'),(1678788000,1678793400,'Fashion Time',20230314,5400,102,24,3360,'',0,1162,632,71,'Γυναικεία μόδα'),(1678793400,1678798800,'Καρδιές Που Ξέρουν Να Αγαπούν ',20230314,5400,451,12,4693,'',0,1298,471,133,'Μια πλούσια κοπέλα αγαπάει ένα φοιτητή ιατρικής, κάνουν όνειρα για να παντρευτούν. Η οικογένεια της κοπέλας έχει άλλα όνειρα'),(1678798800,1678802400,'Ραντεβού Με Την Επικαιρότητα',20230314,3600,64,10,2866,'',0,348,105,101,'Σχολιασμός της επικαιρότητας και ανοιχτή επικοινωνία με τους τηλεθεατές'),(1678802400,1678803900,'Μεσημβρινό Δελτίο Ειδήσεων',20230314,1500,42,11,1332,'',0,121,58,35,'Ειδήσεις με τον Βαγγέλη Σαρρή'),(1678803900,1678806000,'ΕΚΠΟΜΠΕΣ ΤΗΛΕΟΠΤΙΚΩΝ ΑΓΟΡΩΝ',20230314,2100,44,9,1819,'',0,123,54,70,''),(1678806000,1678809600,'Jubilee',20230314,3600,31,3,3270,'',0,342,83,129,'Χειροποίητα κοσμήματα από φυσικές πέτρες'),(1678809600,1678813200,'ΕΚΠΟΜΠΕΣ ΤΗΛΕΟΠΤΙΚΩΝ ΑΓΟΡΩΝ',20230314,3600,44,5,3669,'',0,382,113,132,''),(1678813200,1678817700,'Διάλογο Με Την Αυτοδιοίκηση',20230314,4500,92,33,7109,'',0,2783,592,200,'Η Φωτεινή Βρύνα συζητά θέματα Αυτοδιοίκησης με ανθρώπους της Αυτοδιοίκησης'),(1678817700,1678823400,'Η Εφοπλιστίνα ',20230314,5700,877,39,14084,'',0,4260,436,332,'Η Δέσποινα από πωλήτρια κουλουριών, με έφεση στο τραγούδι,καταφέρνει να γίνει εφοπλιστίνα και να προσαρμοστεί στο νέο της ρόλο'),(1678823400,1678826700,'Κεντρικό Δελτίο Ειδήσεων',20230314,3300,470,126,12690,'',0,6052,431,232,'Οι ειδήσεις της ημέρας με την Λίνα Κλείτου'),(1678826700,1678827000,'Ο Καιρός',20230314,300,1129,850,2010,'',0,1415,208,14,'Πρόβλεψη καιρού'),(1678827000,1678833000,'Παρεμβάσεις',20230314,6000,1222,20,15637,'',0,5349,386,386,'Ανοιχτή πολιτική συζήτηση με πολιτικούς όλων των παρατάξεων. Με τον Σωτήρη Ξενάκη και τον Νίκο Ελευθερόγλου'),(1678833000,1678836600,'Με Το Κλειδί Της Ιστορίας',20230314,3600,85,0,2112,'',0,262,134,60,'Με τον Ιωάννη Θεοδωράτο');
/*!40000 ALTER TABLE `program` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `test`
--

LOCK TABLES `test` WRITE;
/*!40000 ALTER TABLE `test` DISABLE KEYS */;
/*!40000 ALTER TABLE `test` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `total_new`
--

LOCK TABLES `total_new` WRITE;
/*!40000 ALTER TABLE `total_new` DISABLE KEYS */;
/*!40000 ALTER TABLE `total_new` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `unique_ids`
--

LOCK TABLES `unique_ids` WRITE;
/*!40000 ALTER TABLE `unique_ids` DISABLE KEYS */;
/*!40000 ALTER TABLE `unique_ids` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

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

--
-- Dumping data for table `videosreq`
--

LOCK TABLES `videosreq` WRITE;
/*!40000 ALTER TABLE `videosreq` DISABLE KEYS */;
/*!40000 ALTER TABLE `videosreq` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-03-15  9:24:07
