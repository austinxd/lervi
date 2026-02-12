
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
DROP TABLE IF EXISTS `auth_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `auth_group` WRITE;
/*!40000 ALTER TABLE `auth_group` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `auth_group_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `auth_group_permissions` WRITE;
/*!40000 ALTER TABLE `auth_group_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group_permissions` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `auth_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_permission` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `content_type_id` int NOT NULL,
  `codename` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
  CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=133 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `auth_permission` WRITE;
/*!40000 ALTER TABLE `auth_permission` DISABLE KEYS */;
INSERT INTO `auth_permission` VALUES (1,'Can add log entry',1,'add_logentry'),(2,'Can change log entry',1,'change_logentry'),(3,'Can delete log entry',1,'delete_logentry'),(4,'Can view log entry',1,'view_logentry'),(5,'Can add permission',2,'add_permission'),(6,'Can change permission',2,'change_permission'),(7,'Can delete permission',2,'delete_permission'),(8,'Can view permission',2,'view_permission'),(9,'Can add group',3,'add_group'),(10,'Can change group',3,'change_group'),(11,'Can delete group',3,'delete_group'),(12,'Can view group',3,'view_group'),(13,'Can add content type',4,'add_contenttype'),(14,'Can change content type',4,'change_contenttype'),(15,'Can delete content type',4,'delete_contenttype'),(16,'Can view content type',4,'view_contenttype'),(17,'Can add session',5,'add_session'),(18,'Can change session',5,'change_session'),(19,'Can delete session',5,'delete_session'),(20,'Can view session',5,'view_session'),(21,'Can add blacklisted token',6,'add_blacklistedtoken'),(22,'Can change blacklisted token',6,'change_blacklistedtoken'),(23,'Can delete blacklisted token',6,'delete_blacklistedtoken'),(24,'Can view blacklisted token',6,'view_blacklistedtoken'),(25,'Can add outstanding token',7,'add_outstandingtoken'),(26,'Can change outstanding token',7,'change_outstandingtoken'),(27,'Can delete outstanding token',7,'delete_outstandingtoken'),(28,'Can view outstanding token',7,'view_outstandingtoken'),(29,'Can add state transition log',8,'add_statetransitionlog'),(30,'Can change state transition log',8,'change_statetransitionlog'),(31,'Can delete state transition log',8,'delete_statetransitionlog'),(32,'Can view state transition log',8,'view_statetransitionlog'),(33,'Can add organization',9,'add_organization'),(34,'Can change organization',9,'change_organization'),(35,'Can delete organization',9,'delete_organization'),(36,'Can view organization',9,'view_organization'),(37,'Can add property',10,'add_property'),(38,'Can change property',10,'change_property'),(39,'Can delete property',10,'delete_property'),(40,'Can view property',10,'view_property'),(41,'Can add user',11,'add_user'),(42,'Can change user',11,'change_user'),(43,'Can delete user',11,'delete_user'),(44,'Can view user',11,'view_user'),(45,'Can add bed configuration',12,'add_bedconfiguration'),(46,'Can change bed configuration',12,'change_bedconfiguration'),(47,'Can delete bed configuration',12,'delete_bedconfiguration'),(48,'Can view bed configuration',12,'view_bedconfiguration'),(49,'Can add bed configuration detail',13,'add_bedconfigurationdetail'),(50,'Can change bed configuration detail',13,'change_bedconfigurationdetail'),(51,'Can delete bed configuration detail',13,'delete_bedconfigurationdetail'),(52,'Can view bed configuration detail',13,'view_bedconfigurationdetail'),(53,'Can add room type',14,'add_roomtype'),(54,'Can change room type',14,'change_roomtype'),(55,'Can delete room type',14,'delete_roomtype'),(56,'Can view room type',14,'view_roomtype'),(57,'Can add room type photo',15,'add_roomtypephoto'),(58,'Can change room type photo',15,'change_roomtypephoto'),(59,'Can delete room type photo',15,'delete_roomtypephoto'),(60,'Can view room type photo',15,'view_roomtypephoto'),(61,'Can add room',16,'add_room'),(62,'Can change room',16,'change_room'),(63,'Can delete room',16,'delete_room'),(64,'Can view room',16,'view_room'),(65,'Can add guest',17,'add_guest'),(66,'Can change guest',17,'change_guest'),(67,'Can delete guest',17,'delete_guest'),(68,'Can view guest',17,'view_guest'),(69,'Can add guest note',18,'add_guestnote'),(70,'Can change guest note',18,'change_guestnote'),(71,'Can delete guest note',18,'delete_guestnote'),(72,'Can view guest note',18,'view_guestnote'),(73,'Can add reservation',19,'add_reservation'),(74,'Can change reservation',19,'change_reservation'),(75,'Can delete reservation',19,'delete_reservation'),(76,'Can view reservation',19,'view_reservation'),(77,'Can add payment',20,'add_payment'),(78,'Can change payment',20,'change_payment'),(79,'Can delete payment',20,'delete_payment'),(80,'Can view payment',20,'view_payment'),(81,'Can add task',21,'add_task'),(82,'Can change task',21,'change_task'),(83,'Can delete task',21,'delete_task'),(84,'Can view task',21,'view_task'),(85,'Can add promotion',22,'add_promotion'),(86,'Can change promotion',22,'change_promotion'),(87,'Can delete promotion',22,'delete_promotion'),(88,'Can view promotion',22,'view_promotion'),(89,'Can add rate plan',23,'add_rateplan'),(90,'Can change rate plan',23,'change_rateplan'),(91,'Can delete rate plan',23,'delete_rateplan'),(92,'Can view rate plan',23,'view_rateplan'),(93,'Can add season',24,'add_season'),(94,'Can change season',24,'change_season'),(95,'Can delete season',24,'delete_season'),(96,'Can view season',24,'view_season'),(97,'Can add day of week pricing',25,'add_dayofweekpricing'),(98,'Can change day of week pricing',25,'change_dayofweekpricing'),(99,'Can delete day of week pricing',25,'delete_dayofweekpricing'),(100,'Can view day of week pricing',25,'view_dayofweekpricing'),(101,'Can add automation rule',26,'add_automationrule'),(102,'Can change automation rule',26,'change_automationrule'),(103,'Can delete automation rule',26,'delete_automationrule'),(104,'Can view automation rule',26,'view_automationrule'),(105,'Can add automation log',27,'add_automationlog'),(106,'Can change automation log',27,'change_automationlog'),(107,'Can delete automation log',27,'delete_automationlog'),(108,'Can view automation log',27,'view_automationlog'),(109,'Can add property photo',28,'add_propertyphoto'),(110,'Can change property photo',28,'change_propertyphoto'),(111,'Can delete property photo',28,'delete_propertyphoto'),(112,'Can view property photo',28,'view_propertyphoto'),(113,'Can add bank account',29,'add_bankaccount'),(114,'Can change bank account',29,'change_bankaccount'),(115,'Can delete bank account',29,'delete_bankaccount'),(116,'Can view bank account',29,'view_bankaccount'),(117,'Can add Configuracion de facturacion',30,'add_billingconfig'),(118,'Can change Configuracion de facturacion',30,'change_billingconfig'),(119,'Can delete Configuracion de facturacion',30,'delete_billingconfig'),(120,'Can view Configuracion de facturacion',30,'view_billingconfig'),(121,'Can add Configuracion de facturacion por propiedad',31,'add_propertybillingconfig'),(122,'Can change Configuracion de facturacion por propiedad',31,'change_propertybillingconfig'),(123,'Can delete Configuracion de facturacion por propiedad',31,'delete_propertybillingconfig'),(124,'Can view Configuracion de facturacion por propiedad',31,'view_propertybillingconfig'),(125,'Can add invoice',32,'add_invoice'),(126,'Can change invoice',32,'change_invoice'),(127,'Can delete invoice',32,'delete_invoice'),(128,'Can view invoice',32,'view_invoice'),(129,'Can add invoice item',33,'add_invoiceitem'),(130,'Can change invoice item',33,'change_invoiceitem'),(131,'Can delete invoice item',33,'delete_invoiceitem'),(132,'Can view invoice item',33,'view_invoiceitem');
/*!40000 ALTER TABLE `auth_permission` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `automations_automationlog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `automations_automationlog` (
  `id` char(32) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `rule_name` varchar(200) NOT NULL,
  `trigger` varchar(50) NOT NULL,
  `event_data` json NOT NULL,
  `conditions_met` tinyint(1) NOT NULL,
  `actions_executed` json NOT NULL,
  `success` tinyint(1) NOT NULL,
  `error_message` longtext NOT NULL,
  `created_by_id` char(32) DEFAULT NULL,
  `organization_id` char(32) NOT NULL,
  `rule_id` char(32) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `automations_automati_created_by_id_e5f554b6_fk_users_use` (`created_by_id`),
  KEY `automations_automati_organization_id_93ecac20_fk_organizat` (`organization_id`),
  KEY `automations_automati_rule_id_5956bdb3_fk_automatio` (`rule_id`),
  CONSTRAINT `automations_automati_created_by_id_e5f554b6_fk_users_use` FOREIGN KEY (`created_by_id`) REFERENCES `users_user` (`id`),
  CONSTRAINT `automations_automati_organization_id_93ecac20_fk_organizat` FOREIGN KEY (`organization_id`) REFERENCES `organizations_organization` (`id`),
  CONSTRAINT `automations_automati_rule_id_5956bdb3_fk_automatio` FOREIGN KEY (`rule_id`) REFERENCES `automations_automationrule` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `automations_automationlog` WRITE;
/*!40000 ALTER TABLE `automations_automationlog` DISABLE KEYS */;
/*!40000 ALTER TABLE `automations_automationlog` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `automations_automationrule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `automations_automationrule` (
  `id` char(32) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `name` varchar(200) NOT NULL,
  `description` longtext NOT NULL,
  `trigger` varchar(50) NOT NULL,
  `conditions` json NOT NULL,
  `actions` json NOT NULL,
  `priority` smallint unsigned NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `is_system` tinyint(1) NOT NULL,
  `created_by_id` char(32) DEFAULT NULL,
  `organization_id` char(32) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `automations_automati_created_by_id_4e4815cf_fk_users_use` (`created_by_id`),
  KEY `automations_automati_organization_id_5347a0d3_fk_organizat` (`organization_id`),
  CONSTRAINT `automations_automati_created_by_id_4e4815cf_fk_users_use` FOREIGN KEY (`created_by_id`) REFERENCES `users_user` (`id`),
  CONSTRAINT `automations_automati_organization_id_5347a0d3_fk_organizat` FOREIGN KEY (`organization_id`) REFERENCES `organizations_organization` (`id`),
  CONSTRAINT `automations_automationrule_chk_1` CHECK ((`priority` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `automations_automationrule` WRITE;
/*!40000 ALTER TABLE `automations_automationrule` DISABLE KEYS */;
INSERT INTO `automations_automationrule` VALUES ('098b56c44e9644bbb05b84ae3e0fddb4','2026-02-08 21:29:13.855729','2026-02-08 21:29:13.855737','Inspección post limpieza','Cuando una tarea de limpieza se completa, pasa la habitación a inspección.','task.completed','[{\"field\": \"task.task_type\", \"value\": \"cleaning\", \"operator\": \"eq\"}]','[{\"type\": \"change_room_status\", \"new_status\": \"inspection\"}]',2,1,1,NULL,'744c8af5db3a4161ba3123fd6d3cff5f'),('8864a247347c4ef5a15dc1ff0d2114ee','2026-02-08 21:29:13.854256','2026-02-08 21:29:13.854279','Limpieza post check-out','Al hacer check-out, marca la habitación como sucia y crea tarea de limpieza.','reservation.check_out','[]','[{\"type\": \"change_room_status\", \"new_status\": \"dirty\"}, {\"type\": \"create_task\", \"notes\": \"Limpieza post check-out (automática)\", \"priority\": \"high\", \"task_type\": \"cleaning\", \"assigned_role\": \"housekeeping\"}]',1,1,1,NULL,'744c8af5db3a4161ba3123fd6d3cff5f'),('fec92d7c77fa4a6da298b48a961c4af3','2026-02-08 21:29:13.857104','2026-02-08 21:29:13.857112','Liberar habitación por no-show','Cuando una reserva es marcada como no-show, libera la habitación asignada.','reservation.no_show','[]','[{\"type\": \"change_room_status\", \"new_status\": \"available\"}]',3,1,1,NULL,'744c8af5db3a4161ba3123fd6d3cff5f');
/*!40000 ALTER TABLE `automations_automationrule` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `billing_billingconfig`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `billing_billingconfig` (
  `id` char(32) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `emission_mode` varchar(20) NOT NULL,
  `ruc` varchar(20) NOT NULL,
  `razon_social` varchar(300) NOT NULL,
  `direccion_fiscal` longtext NOT NULL,
  `proveedor` varchar(30) NOT NULL,
  `tipo_autenticacion` varchar(20) NOT NULL,
  `api_endpoint` varchar(200) NOT NULL,
  `api_key` varchar(500) NOT NULL,
  `certificado_digital` varchar(100) NOT NULL,
  `ambiente` varchar(20) NOT NULL,
  `configuracion_tributaria` json NOT NULL,
  `organization_id` char(32) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `organization_id` (`organization_id`),
  CONSTRAINT `billing_billingconfi_organization_id_72de040e_fk_organizat` FOREIGN KEY (`organization_id`) REFERENCES `organizations_organization` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `billing_billingconfig` WRITE;
/*!40000 ALTER TABLE `billing_billingconfig` DISABLE KEYS */;
/*!40000 ALTER TABLE `billing_billingconfig` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `billing_invoice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `billing_invoice` (
  `id` char(32) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `document_type` varchar(20) NOT NULL,
  `serie` varchar(10) NOT NULL,
  `correlativo` int unsigned NOT NULL,
  `numero_completo` varchar(20) NOT NULL,
  `status` varchar(20) NOT NULL,
  `cliente_tipo_documento` varchar(10) NOT NULL,
  `cliente_numero_documento` varchar(20) NOT NULL,
  `cliente_razon_social` varchar(300) NOT NULL,
  `cliente_direccion` varchar(500) NOT NULL,
  `cliente_email` varchar(254) NOT NULL,
  `total_gravado` decimal(10,2) NOT NULL,
  `total_exonerado` decimal(10,2) NOT NULL,
  `total_inafecto` decimal(10,2) NOT NULL,
  `total_descuentos` decimal(10,2) NOT NULL,
  `total_igv` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `currency` varchar(3) NOT NULL,
  `fecha_emision` date NOT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `provider_request` json NOT NULL,
  `provider_response` json NOT NULL,
  `provider_http_status` smallint unsigned DEFAULT NULL,
  `provider_latency_ms` int unsigned DEFAULT NULL,
  `provider_error_code` varchar(50) NOT NULL,
  `provider_document_url` varchar(200) NOT NULL,
  `sunat_ticket` varchar(100) NOT NULL,
  `retry_count` smallint unsigned NOT NULL,
  `last_error` longtext NOT NULL,
  `last_attempt_at` datetime(6) DEFAULT NULL,
  `observaciones` longtext NOT NULL,
  `created_by_id` char(32) DEFAULT NULL,
  `organization_id` char(32) NOT NULL,
  `property_id` char(32) NOT NULL,
  `related_invoice_id` char(32) DEFAULT NULL,
  `reservation_id` char(32) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `billing_invoice_organization_id_serie_correlativo_154f743c_uniq` (`organization_id`,`serie`,`correlativo`),
  KEY `billing_invoice_created_by_id_c711181e_fk_users_user_id` (`created_by_id`),
  KEY `billing_invoice_property_id_76398958_fk_organizat` (`property_id`),
  KEY `billing_invoice_related_invoice_id_b41305ac_fk_billing_i` (`related_invoice_id`),
  KEY `billing_invoice_reservation_id_82716edd_fk_reservati` (`reservation_id`),
  CONSTRAINT `billing_invoice_created_by_id_c711181e_fk_users_user_id` FOREIGN KEY (`created_by_id`) REFERENCES `users_user` (`id`),
  CONSTRAINT `billing_invoice_organization_id_244f1474_fk_organizat` FOREIGN KEY (`organization_id`) REFERENCES `organizations_organization` (`id`),
  CONSTRAINT `billing_invoice_property_id_76398958_fk_organizat` FOREIGN KEY (`property_id`) REFERENCES `organizations_property` (`id`),
  CONSTRAINT `billing_invoice_related_invoice_id_b41305ac_fk_billing_i` FOREIGN KEY (`related_invoice_id`) REFERENCES `billing_invoice` (`id`),
  CONSTRAINT `billing_invoice_reservation_id_82716edd_fk_reservati` FOREIGN KEY (`reservation_id`) REFERENCES `reservations_reservation` (`id`),
  CONSTRAINT `billing_invoice_chk_1` CHECK ((`correlativo` >= 0)),
  CONSTRAINT `billing_invoice_chk_2` CHECK ((`provider_http_status` >= 0)),
  CONSTRAINT `billing_invoice_chk_3` CHECK ((`provider_latency_ms` >= 0)),
  CONSTRAINT `billing_invoice_chk_4` CHECK ((`retry_count` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `billing_invoice` WRITE;
/*!40000 ALTER TABLE `billing_invoice` DISABLE KEYS */;
/*!40000 ALTER TABLE `billing_invoice` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `billing_invoiceitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `billing_invoiceitem` (
  `id` char(32) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `description` varchar(500) NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `igv` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `tipo_afectacion_igv` varchar(10) NOT NULL,
  `sort_order` smallint unsigned NOT NULL,
  `invoice_id` char(32) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `billing_invoiceitem_invoice_id_f74c08c6_fk_billing_invoice_id` (`invoice_id`),
  CONSTRAINT `billing_invoiceitem_invoice_id_f74c08c6_fk_billing_invoice_id` FOREIGN KEY (`invoice_id`) REFERENCES `billing_invoice` (`id`),
  CONSTRAINT `billing_invoiceitem_chk_1` CHECK ((`sort_order` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `billing_invoiceitem` WRITE;
/*!40000 ALTER TABLE `billing_invoiceitem` DISABLE KEYS */;
/*!40000 ALTER TABLE `billing_invoiceitem` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `billing_propertybillingconfig`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `billing_propertybillingconfig` (
  `id` char(32) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `usa_configuracion_propia` tinyint(1) NOT NULL,
  `emission_mode` varchar(20) NOT NULL,
  `proveedor` varchar(30) NOT NULL,
  `api_endpoint` varchar(200) NOT NULL,
  `api_key` varchar(500) NOT NULL,
  `serie_boleta` varchar(10) NOT NULL,
  `serie_factura` varchar(10) NOT NULL,
  `establecimiento_codigo` varchar(10) NOT NULL,
  `punto_emision` varchar(10) NOT NULL,
  `property_id` char(32) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `property_id` (`property_id`),
  CONSTRAINT `billing_propertybill_property_id_f9d22cea_fk_organizat` FOREIGN KEY (`property_id`) REFERENCES `organizations_property` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `billing_propertybillingconfig` WRITE;
/*!40000 ALTER TABLE `billing_propertybillingconfig` DISABLE KEYS */;
/*!40000 ALTER TABLE `billing_propertybillingconfig` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `common_statetransitionlog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `common_statetransitionlog` (
  `id` char(32) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `entity_type` varchar(100) NOT NULL,
  `entity_id` char(32) NOT NULL,
  `field` varchar(100) NOT NULL,
  `old_value` varchar(50) NOT NULL,
  `new_value` varchar(50) NOT NULL,
  `changed_by_id` char(32) DEFAULT NULL,
  `organization_id` char(32) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `common_statetransiti_changed_by_id_957f29c4_fk_users_use` (`changed_by_id`),
  KEY `common_statetransiti_organization_id_06ed183b_fk_organizat` (`organization_id`),
  KEY `common_stat_entity__cd761b_idx` (`entity_type`,`entity_id`),
  CONSTRAINT `common_statetransiti_changed_by_id_957f29c4_fk_users_use` FOREIGN KEY (`changed_by_id`) REFERENCES `users_user` (`id`),
  CONSTRAINT `common_statetransiti_organization_id_06ed183b_fk_organizat` FOREIGN KEY (`organization_id`) REFERENCES `organizations_organization` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `common_statetransitionlog` WRITE;
/*!40000 ALTER TABLE `common_statetransitionlog` DISABLE KEYS */;
INSERT INTO `common_statetransitionlog` VALUES ('24a94509d9c24e01b0099a58c0a6bcd8','2026-02-08 21:39:33.315679','2026-02-08 21:39:33.315702','Room','c771d2708a0647c6b1311f764d03dc2f','status','occupied','dirty','59d66e5fa6d54bfa9e9eadad2fed8178','744c8af5db3a4161ba3123fd6d3cff5f'),('381ffccf3cc24afca3a28f2826a17d26','2026-02-10 14:27:21.321209','2026-02-10 14:27:21.321241','Room','aafbf1969244475faea27012569667dd','status','available','maintenance','59d66e5fa6d54bfa9e9eadad2fed8178','744c8af5db3a4161ba3123fd6d3cff5f'),('6fb7a85e3ea746fe9e8089239f3a5ffc','2026-02-08 21:39:42.537977','2026-02-08 21:39:42.537998','Room','c771d2708a0647c6b1311f764d03dc2f','status','cleaning','inspection','59d66e5fa6d54bfa9e9eadad2fed8178','744c8af5db3a4161ba3123fd6d3cff5f'),('cb7449e474244b0b900960a72a7e95cd','2026-02-08 21:39:40.850176','2026-02-08 21:39:40.850197','Room','c771d2708a0647c6b1311f764d03dc2f','status','dirty','cleaning','59d66e5fa6d54bfa9e9eadad2fed8178','744c8af5db3a4161ba3123fd6d3cff5f'),('d050adb4ea854d4cb48fec775403b8c0','2026-02-08 21:39:27.645831','2026-02-08 21:39:27.645843','Room','495b32ddc5d54152a5838fe77352114d','status','available','blocked','59d66e5fa6d54bfa9e9eadad2fed8178','744c8af5db3a4161ba3123fd6d3cff5f'),('d8f8fc4f479a41fd8faf5077857adf7e','2026-02-08 21:39:44.535161','2026-02-08 21:39:44.535179','Room','c771d2708a0647c6b1311f764d03dc2f','status','inspection','available','59d66e5fa6d54bfa9e9eadad2fed8178','744c8af5db3a4161ba3123fd6d3cff5f');
/*!40000 ALTER TABLE `common_statetransitionlog` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `django_admin_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_admin_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint unsigned NOT NULL,
  `change_message` longtext NOT NULL,
  `content_type_id` int DEFAULT NULL,
  `user_id` char(32) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  KEY `django_admin_log_user_id_c564eba6_fk_users_user_id` (`user_id`),
  CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  CONSTRAINT `django_admin_log_user_id_c564eba6_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`),
  CONSTRAINT `django_admin_log_chk_1` CHECK ((`action_flag` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `django_admin_log` WRITE;
/*!40000 ALTER TABLE `django_admin_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_admin_log` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `django_content_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_content_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `django_content_type` WRITE;
/*!40000 ALTER TABLE `django_content_type` DISABLE KEYS */;
INSERT INTO `django_content_type` VALUES (1,'admin','logentry'),(3,'auth','group'),(2,'auth','permission'),(27,'automations','automationlog'),(26,'automations','automationrule'),(30,'billing','billingconfig'),(32,'billing','invoice'),(33,'billing','invoiceitem'),(31,'billing','propertybillingconfig'),(8,'common','statetransitionlog'),(4,'contenttypes','contenttype'),(17,'guests','guest'),(18,'guests','guestnote'),(29,'organizations','bankaccount'),(9,'organizations','organization'),(10,'organizations','property'),(28,'organizations','propertyphoto'),(25,'pricing','dayofweekpricing'),(22,'pricing','promotion'),(23,'pricing','rateplan'),(24,'pricing','season'),(20,'reservations','payment'),(19,'reservations','reservation'),(12,'rooms','bedconfiguration'),(13,'rooms','bedconfigurationdetail'),(16,'rooms','room'),(14,'rooms','roomtype'),(15,'rooms','roomtypephoto'),(5,'sessions','session'),(21,'tasks','task'),(6,'token_blacklist','blacklistedtoken'),(7,'token_blacklist','outstandingtoken'),(11,'users','user');
/*!40000 ALTER TABLE `django_content_type` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `django_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_migrations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `django_migrations` WRITE;
/*!40000 ALTER TABLE `django_migrations` DISABLE KEYS */;
INSERT INTO `django_migrations` VALUES (1,'organizations','0001_initial','2026-02-08 21:28:49.809787'),(2,'contenttypes','0001_initial','2026-02-08 21:28:49.820035'),(3,'contenttypes','0002_remove_content_type_name','2026-02-08 21:28:49.839991'),(4,'auth','0001_initial','2026-02-08 21:28:49.910105'),(5,'auth','0002_alter_permission_name_max_length','2026-02-08 21:28:49.923288'),(6,'auth','0003_alter_user_email_max_length','2026-02-08 21:28:49.925254'),(7,'auth','0004_alter_user_username_opts','2026-02-08 21:28:49.926894'),(8,'auth','0005_alter_user_last_login_null','2026-02-08 21:28:49.929015'),(9,'auth','0006_require_contenttypes_0002','2026-02-08 21:28:49.929397'),(10,'auth','0007_alter_validators_add_error_messages','2026-02-08 21:28:49.930975'),(11,'auth','0008_alter_user_username_max_length','2026-02-08 21:28:49.933032'),(12,'auth','0009_alter_user_last_name_max_length','2026-02-08 21:28:49.935373'),(13,'auth','0010_alter_group_name_max_length','2026-02-08 21:28:49.938997'),(14,'auth','0011_update_proxy_permissions','2026-02-08 21:28:49.941837'),(15,'auth','0012_alter_user_first_name_max_length','2026-02-08 21:28:49.943557'),(16,'users','0001_initial','2026-02-08 21:28:50.028449'),(17,'admin','0001_initial','2026-02-08 21:28:50.052849'),(18,'admin','0002_logentry_remove_auto_add','2026-02-08 21:28:50.056499'),(19,'admin','0003_logentry_add_action_flag_choices','2026-02-08 21:28:50.059909'),(20,'automations','0001_initial','2026-02-08 21:28:50.126765'),(21,'common','0001_initial','2026-02-08 21:28:50.130839'),(22,'common','0002_initial','2026-02-08 21:28:50.162089'),(23,'guests','0001_initial','2026-02-08 21:28:50.169652'),(24,'guests','0002_initial','2026-02-08 21:28:50.247612'),(25,'rooms','0001_initial','2026-02-08 21:28:50.355303'),(26,'pricing','0001_initial','2026-02-08 21:28:50.455580'),(27,'reservations','0001_initial','2026-02-08 21:28:50.597985'),(28,'sessions','0001_initial','2026-02-08 21:28:50.603335'),(29,'tasks','0001_initial','2026-02-08 21:28:50.659012'),(30,'token_blacklist','0001_initial','2026-02-08 21:28:50.701419'),(31,'token_blacklist','0002_outstandingtoken_jti_hex','2026-02-08 21:28:50.715031'),(32,'token_blacklist','0003_auto_20171017_2007','2026-02-08 21:28:50.726318'),(33,'token_blacklist','0004_auto_20171017_2013','2026-02-08 21:28:50.744626'),(34,'token_blacklist','0005_remove_outstandingtoken_jti','2026-02-08 21:28:50.758103'),(35,'token_blacklist','0006_auto_20171017_2113','2026-02-08 21:28:50.769254'),(36,'token_blacklist','0007_auto_20171017_2214','2026-02-08 21:28:50.814585'),(37,'token_blacklist','0008_migrate_to_bigautofield','2026-02-08 21:28:50.861487'),(38,'token_blacklist','0010_fix_migrate_to_bigautofield','2026-02-08 21:28:50.874468'),(39,'token_blacklist','0011_linearizes_history','2026-02-08 21:28:50.875381'),(40,'token_blacklist','0012_alter_outstandingtoken_user','2026-02-08 21:28:50.884739'),(41,'rooms','0002_remove_roomtypephoto_url_roomtypephoto_image','2026-02-08 21:46:04.750349'),(42,'pricing','0002_season_recurring_dates','2026-02-08 22:19:55.951827'),(43,'rooms','0003_room_m2m_room_types','2026-02-08 22:37:31.298019'),(44,'organizations','0002_property_amenities_property_description_and_more','2026-02-09 08:14:46.652278'),(45,'rooms','0004_roomtype_bathroom_type_roomtype_highlights_and_more','2026-02-09 08:14:46.782403'),(46,'organizations','0003_property_theme_accent_color_property_theme_palette_and_more','2026-02-09 08:45:11.737244'),(47,'organizations','0004_property_logo','2026-02-09 09:03:47.278833'),(48,'organizations','0005_alter_property_theme_template','2026-02-09 10:55:37.431696'),(49,'organizations','0006_add_custom_domain_to_property','2026-02-12 06:04:43.757503'),(50,'organizations','0007_bankaccount','2026-02-12 06:24:32.278641'),(51,'reservations','0002_reservation_payment_deadline_and_more','2026-02-12 06:24:32.352840'),(52,'billing','0001_initial','2026-02-12 07:34:01.331675');
/*!40000 ALTER TABLE `django_migrations` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `django_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_a5c62663` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `django_session` WRITE;
/*!40000 ALTER TABLE `django_session` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_session` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `guests_guest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guests_guest` (
  `id` char(32) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `email` varchar(254) NOT NULL,
  `phone` varchar(30) NOT NULL,
  `document_type` varchar(20) NOT NULL,
  `document_number` varchar(50) NOT NULL,
  `nationality` varchar(100) NOT NULL,
  `country_of_residence` varchar(100) NOT NULL,
  `is_vip` tinyint(1) NOT NULL,
  `created_by_id` char(32) DEFAULT NULL,
  `organization_id` char(32) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `guests_guest_created_by_id_b319d927_fk_users_user_id` (`created_by_id`),
  KEY `guests_guest_organization_id_8d55fc65_fk_organizat` (`organization_id`),
  CONSTRAINT `guests_guest_created_by_id_b319d927_fk_users_user_id` FOREIGN KEY (`created_by_id`) REFERENCES `users_user` (`id`),
  CONSTRAINT `guests_guest_organization_id_8d55fc65_fk_organizat` FOREIGN KEY (`organization_id`) REFERENCES `organizations_organization` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `guests_guest` WRITE;
/*!40000 ALTER TABLE `guests_guest` DISABLE KEYS */;
INSERT INTO `guests_guest` VALUES ('11a58ecfddba4c4094a51b78d9d3fc51','2026-02-08 21:37:14.415275','2026-02-08 21:37:14.415282','Sofía','Weber','sofia.weber@web.de','+49 170 1234567','PASSPORT','DE55667788','Alemana','',0,NULL,'744c8af5db3a4161ba3123fd6d3cff5f'),('5e06278b638a4ca4a1fbb6cf81ae4a8a','2026-02-08 21:37:14.409488','2026-02-08 21:37:14.409495','María','Fernández','maria.fernandez@yahoo.com','+51 999 111 004','DNI','78945612','Peruana','',0,NULL,'744c8af5db3a4161ba3123fd6d3cff5f'),('6c8c4532587f4b4a8785f619cddb8553','2026-02-08 21:37:14.410600','2026-02-08 21:37:14.410606','Carlos','Tanaka','c.tanaka@outlook.com','+81 90 1234 5678','PASSPORT','JP98765432','Japonesa','',1,NULL,'744c8af5db3a4161ba3123fd6d3cff5f'),('73810be675f24aad9128a2cd9fe58496','2026-02-08 21:37:14.419593','2026-02-08 21:37:14.419599','Camila','Ríos','camila.rios@gmail.com','+56 9 8765 4321','PASSPORT','CL99887766','Chilena','',1,NULL,'744c8af5db3a4161ba3123fd6d3cff5f'),('7c08364bdab04d50bc4cc48c40c75b39','2026-02-08 21:37:14.416430','2026-02-08 21:37:14.416436','Diego','Torres','diego.torres@gmail.com','+54 11 5555 0001','PASSPORT','AR11223344','Argentina','',0,NULL,'744c8af5db3a4161ba3123fd6d3cff5f'),('7e72fe4656e644c59391140c91199a54','2026-02-08 21:37:14.412338','2026-02-08 21:37:14.412343','Lucía','García','lucia.g@gmail.com','+51 999 111 006','DNI','15935748','Peruana','',0,NULL,'744c8af5db3a4161ba3123fd6d3cff5f'),('851bfc8a338d4ac3b45f15f5ec7f4a0d','2026-02-08 21:37:14.405371','2026-02-08 21:37:14.405379','Juan','Pérez','juan.perez@gmail.com','+51 999 111 001','DNI','45678901','Peruana','',0,NULL,'744c8af5db3a4161ba3123fd6d3cff5f'),('997b93d047f3413ba6ba324bd53432d7','2026-02-08 21:37:14.406700','2026-02-08 21:37:14.406706','Ana','Rodríguez','ana.rodriguez@hotmail.com','+51 999 111 002','DNI','32165498','Peruana','',1,NULL,'744c8af5db3a4161ba3123fd6d3cff5f'),('9e9eca86cb874881b306956e1a764210','2026-02-08 21:37:14.417461','2026-02-08 21:37:14.417467','Valentina','López','vale.lopez@gmail.com','+51 999 111 010','CE','CE-20230045','Colombiana','',0,NULL,'744c8af5db3a4161ba3123fd6d3cff5f'),('a2917f270ce545e582f088c0af3d5189','2026-02-08 21:37:14.418504','2026-02-08 21:37:14.418512','Fernando','Huamán','f.huaman@outlook.com','+51 999 111 011','DNI','48261537','Peruana','',0,NULL,'744c8af5db3a4161ba3123fd6d3cff5f'),('ed83d5c195c044518592e76eb553e273','2026-02-08 21:37:14.408443','2026-02-08 21:37:14.408448','Roberto','Smith','r.smith@gmail.com','+1 555 123 4567','PASSPORT','US12345678','Estadounidense','',0,NULL,'744c8af5db3a4161ba3123fd6d3cff5f'),('f3945a0bf44640b091981a9021fac80f','2026-02-08 21:37:14.413840','2026-02-08 21:37:14.413849','Pedro','Martínez','pedro.m@gmail.com','+51 999 111 007','DNI','35795148','Peruana','',0,NULL,'744c8af5db3a4161ba3123fd6d3cff5f');
/*!40000 ALTER TABLE `guests_guest` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `guests_guestnote`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guests_guestnote` (
  `id` char(32) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `content` longtext NOT NULL,
  `created_by_id` char(32) DEFAULT NULL,
  `guest_id` char(32) NOT NULL,
  `organization_id` char(32) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `guests_guestnote_created_by_id_b65c75e5_fk_users_user_id` (`created_by_id`),
  KEY `guests_guestnote_guest_id_690fe962_fk_guests_guest_id` (`guest_id`),
  KEY `guests_guestnote_organization_id_a6bf6dcd_fk_organizat` (`organization_id`),
  CONSTRAINT `guests_guestnote_created_by_id_b65c75e5_fk_users_user_id` FOREIGN KEY (`created_by_id`) REFERENCES `users_user` (`id`),
  CONSTRAINT `guests_guestnote_guest_id_690fe962_fk_guests_guest_id` FOREIGN KEY (`guest_id`) REFERENCES `guests_guest` (`id`),
  CONSTRAINT `guests_guestnote_organization_id_a6bf6dcd_fk_organizat` FOREIGN KEY (`organization_id`) REFERENCES `organizations_organization` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `guests_guestnote` WRITE;
/*!40000 ALTER TABLE `guests_guestnote` DISABLE KEYS */;
INSERT INTO `guests_guestnote` VALUES ('a2e427a142244c88a8654a6ca7ca0c18','2026-02-08 21:37:14.420369','2026-02-08 21:37:14.420375','Huésped frecuente y VIP. Ofrecer upgrade cuando esté disponible.',NULL,'73810be675f24aad9128a2cd9fe58496','744c8af5db3a4161ba3123fd6d3cff5f'),('b8cc1776a3db457e83577504b20ab4a9','2026-02-08 21:37:14.407456','2026-02-08 21:37:14.407460','Huésped frecuente y VIP. Ofrecer upgrade cuando esté disponible.',NULL,'997b93d047f3413ba6ba324bd53432d7','744c8af5db3a4161ba3123fd6d3cff5f'),('b9466755c5524f57956a3a6ecd0ed39e','2026-02-08 21:37:14.411246','2026-02-08 21:37:14.411253','Huésped frecuente y VIP. Ofrecer upgrade cuando esté disponible.',NULL,'6c8c4532587f4b4a8785f619cddb8553','744c8af5db3a4161ba3123fd6d3cff5f');
/*!40000 ALTER TABLE `guests_guestnote` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `organizations_bankaccount`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organizations_bankaccount` (
  `id` char(32) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `bank_name` varchar(100) NOT NULL,
  `account_holder` varchar(200) NOT NULL,
  `account_number` varchar(50) NOT NULL,
  `cci` varchar(50) NOT NULL,
  `currency` varchar(3) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `sort_order` smallint unsigned NOT NULL,
  `property_id` char(32) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `organizations_bankac_property_id_f2435f4b_fk_organizat` (`property_id`),
  CONSTRAINT `organizations_bankac_property_id_f2435f4b_fk_organizat` FOREIGN KEY (`property_id`) REFERENCES `organizations_property` (`id`),
  CONSTRAINT `organizations_bankaccount_chk_1` CHECK ((`sort_order` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `organizations_bankaccount` WRITE;
/*!40000 ALTER TABLE `organizations_bankaccount` DISABLE KEYS */;
/*!40000 ALTER TABLE `organizations_bankaccount` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `organizations_organization`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organizations_organization` (
  `id` char(32) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `name` varchar(255) NOT NULL,
  `legal_name` varchar(255) NOT NULL,
  `tax_id` varchar(50) NOT NULL,
  `timezone` varchar(50) NOT NULL,
  `currency` varchar(3) NOT NULL,
  `language` varchar(10) NOT NULL,
  `logo` varchar(200) NOT NULL,
  `primary_color` varchar(7) NOT NULL,
  `secondary_color` varchar(7) NOT NULL,
  `font` varchar(100) NOT NULL,
  `subdomain` varchar(63) NOT NULL,
  `custom_domain` varchar(255) NOT NULL,
  `plan` varchar(50) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `subdomain` (`subdomain`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `organizations_organization` WRITE;
/*!40000 ALTER TABLE `organizations_organization` DISABLE KEYS */;
INSERT INTO `organizations_organization` VALUES ('744c8af5db3a4161ba3123fd6d3cff5f','2026-02-08 21:29:13.276128','2026-02-08 21:49:10.932414','Hotel Arena Blanca','Hotel Arena Blanca S.A.C.','20123456789','America/Lima','PEN','es','','#1976D2','#FF9800','','demo','','basic',1);
/*!40000 ALTER TABLE `organizations_organization` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `organizations_property`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organizations_property` (
  `id` char(32) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `address` longtext NOT NULL,
  `city` varchar(100) NOT NULL,
  `country` varchar(100) NOT NULL,
  `latitude` decimal(9,6) DEFAULT NULL,
  `longitude` decimal(9,6) DEFAULT NULL,
  `check_in_time` time(6) NOT NULL,
  `check_out_time` time(6) NOT NULL,
  `policies` json NOT NULL,
  `contact_phone` varchar(30) NOT NULL,
  `contact_email` varchar(254) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `organization_id` char(32) NOT NULL,
  `amenities` json NOT NULL DEFAULT (_utf8mb4'[]'),
  `description` longtext NOT NULL,
  `hero_image` varchar(100) NOT NULL,
  `languages` json NOT NULL DEFAULT (_utf8mb4'[]'),
  `payment_methods` json NOT NULL DEFAULT (_utf8mb4'[]'),
  `social_links` json NOT NULL DEFAULT (_utf8mb4'{}'),
  `stars` smallint unsigned DEFAULT NULL,
  `tagline` varchar(200) NOT NULL,
  `website_url` varchar(200) NOT NULL,
  `whatsapp` varchar(30) NOT NULL,
  `theme_accent_color` varchar(7) NOT NULL,
  `theme_palette` varchar(30) NOT NULL,
  `theme_primary_color` varchar(7) NOT NULL,
  `theme_template` varchar(20) NOT NULL,
  `logo` varchar(100) NOT NULL,
  `custom_domain` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `organizations_property_organization_id_slug_04a5f8c8_uniq` (`organization_id`,`slug`),
  UNIQUE KEY `custom_domain` (`custom_domain`),
  KEY `organizations_property_slug_55e2f6e7` (`slug`),
  CONSTRAINT `organizations_proper_organization_id_86f2b081_fk_organizat` FOREIGN KEY (`organization_id`) REFERENCES `organizations_organization` (`id`),
  CONSTRAINT `organizations_property_chk_1` CHECK ((`stars` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `organizations_property` WRITE;
/*!40000 ALTER TABLE `organizations_property` DISABLE KEYS */;
INSERT INTO `organizations_property` VALUES ('4a248d0e510046688aaf246a9763137c','2026-02-08 21:29:13.281783','2026-02-10 15:16:26.253055','Hotel Arena Blanca','hotel-arena-blanca','Av. José Larco 820, Miraflores','Lima','PE',-12.119600,-77.031000,'14:00:00.000000','12:00:00.000000','{\"pets\": \"No se admiten mascotas.\", \"smoking\": \"Hotel 100% libre de humo. Áreas de fumadores en terraza.\", \"children\": \"Niños de todas las edades son bienvenidos. Cunas disponibles bajo solicitud.\", \"cancellation\": \"Cancelación gratuita hasta 48 horas antes del check-in. Después se cobra la primera noche.\", \"check_in_early\": \"Sujeto a disponibilidad, sin cargo adicional.\", \"check_out_late\": \"Disponible hasta las 14:00 con cargo de 50% de la tarifa.\"}','+51 1 234 5678','reservas@hotelarena.pe',1,'744c8af5db3a4161ba3123fd6d3cff5f','[\"Wi-Fi gratuito\", \"Piscina en rooftop\", \"Restaurante\", \"Bar\", \"Gimnasio\", \"Estacionamiento\", \"Room service 24h\", \"Lavandería\", \"Concierge\", \"Centro de negocios\", \"Spa\", \"Terraza panorámica\"]','Hotel Arena Blanca es un hotel boutique de 4 estrellas ubicado en el corazón de Miraflores, a pocos pasos del malecón y las mejores opciones gastronómicas de Lima. Con una arquitectura que fusiona lo contemporáneo con la calidez peruana, ofrecemos 42 habitaciones diseñadas para el descanso y la inspiración.\n\nNuestro compromiso es brindar una experiencia auténtica: desayunos con productos locales, un rooftop con vista al Pacífico, y un equipo que conoce cada rincón de la ciudad para hacer de su estadía algo memorable.','properties/hero.jpg','[\"Español\", \"English\", \"Português\"]','[\"Visa\", \"Mastercard\", \"Efectivo\", \"Transferencia\", \"Yape\"]','{\"facebook\": \"https://facebook.com/hotelarena\", \"instagram\": \"https://instagram.com/hotelarena\", \"google_maps\": \"https://maps.google.com/?q=-12.1196,-77.0310\", \"tripadvisor\": \"https://tripadvisor.com/hotelarena\"}',4,'Tu refugio frente al mar en el corazón de Miraflores','https://hotelarenablanca.pe','+51987654321','#c4a265','navy-gold','#0c0c0c','premium','',NULL);
/*!40000 ALTER TABLE `organizations_property` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `organizations_propertyphoto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organizations_propertyphoto` (
  `id` char(32) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `image` varchar(100) NOT NULL,
  `caption` varchar(255) NOT NULL,
  `sort_order` smallint unsigned NOT NULL,
  `property_id` char(32) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `organizations_proper_property_id_c2eda1cf_fk_organizat` (`property_id`),
  CONSTRAINT `organizations_proper_property_id_c2eda1cf_fk_organizat` FOREIGN KEY (`property_id`) REFERENCES `organizations_property` (`id`),
  CONSTRAINT `organizations_propertyphoto_chk_1` CHECK ((`sort_order` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `organizations_propertyphoto` WRITE;
/*!40000 ALTER TABLE `organizations_propertyphoto` DISABLE KEYS */;
INSERT INTO `organizations_propertyphoto` VALUES ('4235285639824402a694f1346152d027','2026-02-10 15:10:03.992529','2026-02-10 15:10:03.992542','property_photos/reception.jpg','Recepción',4,'4a248d0e510046688aaf246a9763137c'),('960363f020414868ad13f440f8bd0f94','2026-02-10 15:10:03.990410','2026-02-10 15:10:03.990422','property_photos/exterior.jpg','Fachada del hotel',3,'4a248d0e510046688aaf246a9763137c'),('ab71f185a7de4843a88350e4c0e4a8c8','2026-02-10 15:10:03.988057','2026-02-10 15:10:03.988068','property_photos/pool.jpg','Piscina en rooftop',2,'4a248d0e510046688aaf246a9763137c'),('be5180393d574b79b06cac4863b04990','2026-02-10 15:10:03.981471','2026-02-10 15:10:03.981485','property_photos/lobby.jpg','Lobby principal',1,'4a248d0e510046688aaf246a9763137c'),('cda444375b9d4230939ad7e59a59fa94','2026-02-10 15:10:03.994398','2026-02-10 15:10:03.994407','property_photos/restaurant.jpg','Restaurante',5,'4a248d0e510046688aaf246a9763137c');
/*!40000 ALTER TABLE `organizations_propertyphoto` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `pricing_dayofweekpricing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pricing_dayofweekpricing` (
  `id` char(32) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `day_of_week` smallint unsigned NOT NULL,
  `price_modifier` decimal(5,2) NOT NULL,
  `property_id` char(32) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pricing_dayofweekpricing_property_id_day_of_week_07f8b926_uniq` (`property_id`,`day_of_week`),
  CONSTRAINT `pricing_dayofweekpri_property_id_555d0b71_fk_organizat` FOREIGN KEY (`property_id`) REFERENCES `organizations_property` (`id`),
  CONSTRAINT `pricing_dayofweekpricing_chk_1` CHECK ((`day_of_week` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `pricing_dayofweekpricing` WRITE;
/*!40000 ALTER TABLE `pricing_dayofweekpricing` DISABLE KEYS */;
INSERT INTO `pricing_dayofweekpricing` VALUES ('0da326be51d94c139dc7aabe95c1acd9','2026-02-08 21:37:14.426529','2026-02-08 21:37:14.426534',0,1.00,'4a248d0e510046688aaf246a9763137c'),('25013cf7a03b4926bc86f82326e67e4e','2026-02-08 21:37:14.428573','2026-02-08 21:37:14.428579',2,1.00,'4a248d0e510046688aaf246a9763137c'),('490ba5005b5347ed9694990d31eb9194','2026-02-08 21:37:14.427615','2026-02-08 21:37:14.427621',1,1.00,'4a248d0e510046688aaf246a9763137c'),('5e7dfcf09fe645a2ae11597741676e25','2026-02-08 21:37:14.433797','2026-02-08 21:37:14.433802',6,1.10,'4a248d0e510046688aaf246a9763137c'),('9187a0adaad44712b06000b937a21bef','2026-02-08 21:37:14.432936','2026-02-08 21:37:14.432944',5,1.25,'4a248d0e510046688aaf246a9763137c'),('ba94b5593f5d40359310969f0d6adeec','2026-02-08 21:37:14.431910','2026-02-08 21:37:14.431915',4,1.15,'4a248d0e510046688aaf246a9763137c'),('c98cc9971c084ef3998eec69c3ca9599','2026-02-08 21:37:14.429725','2026-02-08 21:37:14.429730',3,1.05,'4a248d0e510046688aaf246a9763137c');
/*!40000 ALTER TABLE `pricing_dayofweekpricing` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `pricing_promotion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pricing_promotion` (
  `id` char(32) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `name` varchar(100) NOT NULL,
  `code` varchar(50) NOT NULL,
  `discount_percent` decimal(5,2) NOT NULL,
  `discount_fixed` decimal(10,2) NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `min_nights` smallint unsigned NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `property_id` char(32) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `pricing_promotion_property_id_b8f815d3_fk_organizat` (`property_id`),
  CONSTRAINT `pricing_promotion_property_id_b8f815d3_fk_organizat` FOREIGN KEY (`property_id`) REFERENCES `organizations_property` (`id`),
  CONSTRAINT `pricing_promotion_chk_1` CHECK ((`min_nights` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `pricing_promotion` WRITE;
/*!40000 ALTER TABLE `pricing_promotion` DISABLE KEYS */;
INSERT INTO `pricing_promotion` VALUES ('2aa6387f309a4588ac2f5e4546736c18','2026-02-08 21:37:14.444634','2026-02-08 21:37:14.444640','Bienvenida web','WEB15',15.00,0.00,'2026-01-09','2026-08-07',1,1,'4a248d0e510046688aaf246a9763137c'),('99c478924d444980af5fcc1bae011d2e','2026-02-08 21:37:14.445804','2026-02-08 21:37:14.445810','Descuento corporativo','CORP20',0.00,50.00,'2026-01-09','2026-08-07',1,1,'4a248d0e510046688aaf246a9763137c'),('a69ab41c474944439ca4cb2212aad0af','2026-02-08 21:37:14.443483','2026-02-08 21:37:14.443490','Larga estadía','LARGA5',10.00,0.00,'2026-01-09','2026-08-07',5,1,'4a248d0e510046688aaf246a9763137c');
/*!40000 ALTER TABLE `pricing_promotion` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `pricing_rateplan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pricing_rateplan` (
  `id` char(32) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `name` varchar(100) NOT NULL,
  `plan_type` varchar(20) NOT NULL,
  `price_modifier` decimal(5,2) NOT NULL,
  `min_nights` smallint unsigned NOT NULL,
  `min_advance_days` smallint unsigned NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `property_id` char(32) NOT NULL,
  `room_type_id` char(32) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `pricing_rateplan_property_id_b49d5310_fk_organizat` (`property_id`),
  KEY `pricing_rateplan_room_type_id_61a3530e_fk_rooms_roomtype_id` (`room_type_id`),
  CONSTRAINT `pricing_rateplan_property_id_b49d5310_fk_organizat` FOREIGN KEY (`property_id`) REFERENCES `organizations_property` (`id`),
  CONSTRAINT `pricing_rateplan_room_type_id_61a3530e_fk_rooms_roomtype_id` FOREIGN KEY (`room_type_id`) REFERENCES `rooms_roomtype` (`id`),
  CONSTRAINT `pricing_rateplan_chk_1` CHECK ((`min_nights` >= 0)),
  CONSTRAINT `pricing_rateplan_chk_2` CHECK ((`min_advance_days` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `pricing_rateplan` WRITE;
/*!40000 ALTER TABLE `pricing_rateplan` DISABLE KEYS */;
/*!40000 ALTER TABLE `pricing_rateplan` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `pricing_season`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pricing_season` (
  `id` char(32) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `name` varchar(100) NOT NULL,
  `price_modifier` decimal(5,2) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `property_id` char(32) NOT NULL,
  `end_day` smallint unsigned NOT NULL,
  `end_month` smallint unsigned NOT NULL,
  `start_day` smallint unsigned NOT NULL,
  `start_month` smallint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `pricing_season_property_id_19a22844_fk_organizations_property_id` (`property_id`),
  CONSTRAINT `pricing_season_property_id_19a22844_fk_organizations_property_id` FOREIGN KEY (`property_id`) REFERENCES `organizations_property` (`id`),
  CONSTRAINT `pricing_season_chk_1` CHECK ((`end_day` >= 0)),
  CONSTRAINT `pricing_season_chk_2` CHECK ((`end_month` >= 0)),
  CONSTRAINT `pricing_season_chk_3` CHECK ((`start_day` >= 0)),
  CONSTRAINT `pricing_season_chk_4` CHECK ((`start_month` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `pricing_season` WRITE;
/*!40000 ALTER TABLE `pricing_season` DISABLE KEYS */;
INSERT INTO `pricing_season` VALUES ('8e00566d64254a9cb8e17323cb4c2199','2026-02-08 22:20:04.376479','2026-02-08 22:20:04.376495','Temporada Alta Verano',1.30,1,'4a248d0e510046688aaf246a9763137c',31,3,1,1),('90891aec0eb347f3926056eb11dde2d7','2026-02-08 22:20:04.378854','2026-02-08 22:20:04.378864','Temporada Baja',0.85,1,'4a248d0e510046688aaf246a9763137c',30,6,1,5),('951a9abfb47c45e69e6a6469ead23d8b','2026-02-08 22:20:04.379343','2026-02-08 22:20:04.379349','Navidad y Año Nuevo',1.50,1,'4a248d0e510046688aaf246a9763137c',5,1,20,12),('fae8b49a451b4bebbb7895f06b6eccad','2026-02-08 22:20:04.377917','2026-02-08 22:20:04.377935','Fiestas Patrias',1.40,1,'4a248d0e510046688aaf246a9763137c',31,7,15,7);
/*!40000 ALTER TABLE `pricing_season` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `reservations_payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservations_payment` (
  `id` char(32) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) NOT NULL,
  `method` varchar(20) NOT NULL,
  `status` varchar(20) NOT NULL,
  `gateway_reference` varchar(255) NOT NULL,
  `processed_at` datetime(6) NOT NULL,
  `notes` longtext NOT NULL,
  `created_by_id` char(32) DEFAULT NULL,
  `organization_id` char(32) NOT NULL,
  `reservation_id` char(32) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `reservations_payment_created_by_id_ea91928a_fk_users_user_id` (`created_by_id`),
  KEY `reservations_payment_organization_id_db45a619_fk_organizat` (`organization_id`),
  KEY `reservations_payment_reservation_id_ba9f1ee1_fk_reservati` (`reservation_id`),
  CONSTRAINT `reservations_payment_created_by_id_ea91928a_fk_users_user_id` FOREIGN KEY (`created_by_id`) REFERENCES `users_user` (`id`),
  CONSTRAINT `reservations_payment_organization_id_db45a619_fk_organizat` FOREIGN KEY (`organization_id`) REFERENCES `organizations_organization` (`id`),
  CONSTRAINT `reservations_payment_reservation_id_ba9f1ee1_fk_reservati` FOREIGN KEY (`reservation_id`) REFERENCES `reservations_reservation` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `reservations_payment` WRITE;
/*!40000 ALTER TABLE `reservations_payment` DISABLE KEYS */;
INSERT INTO `reservations_payment` VALUES ('0ec32242ca6549f59c2bd51f2a596059','2026-02-08 21:49:45.897939','2026-02-08 21:49:45.897943',225.00,'PEN','online','completed','','2026-02-08 21:49:45.897951','OTA',NULL,'744c8af5db3a4161ba3123fd6d3cff5f','476c1022f1aa49fea378b03ee0eff06d'),('3d42cb373f914e4fb00b674c6f90ac55','2026-02-08 21:49:45.892378','2026-02-08 21:49:45.892384',450.00,'PEN','online','completed','','2026-02-08 21:49:45.892395','Pago anticipado',NULL,'744c8af5db3a4161ba3123fd6d3cff5f','31b6d7c68a57420890dd8ec2e28ca489'),('45a5ca1c661c4f45a391540b8c3a91ff','2026-02-08 21:49:45.886385','2026-02-08 21:49:45.886389',400.00,'PEN','card','completed','','2026-02-08 21:49:45.886397','Adelanto',NULL,'744c8af5db3a4161ba3123fd6d3cff5f','39803797117a4e3588d8011ab9355158'),('48c4dd6cfe864bbb99d3e4b9c486645d','2026-02-08 21:49:45.883984','2026-02-08 21:49:45.883991',240.00,'PEN','cash','completed','','2026-02-08 21:49:45.884001','',NULL,'744c8af5db3a4161ba3123fd6d3cff5f','35856a692aa140c1a13d7689eb75cfc0'),('4dadedd891584dc4bfddb2e7b0c57c51','2026-02-08 21:49:45.896141','2026-02-08 21:49:45.896147',360.00,'PEN','cash','completed','','2026-02-08 21:49:45.896158','',NULL,'744c8af5db3a4161ba3123fd6d3cff5f','097e642b2408493aa9069c0c78924b95'),('6c0695f8831645c3a54f52e89ff25cd1','2026-02-08 21:49:45.898458','2026-02-08 21:49:45.898462',225.00,'PEN','card','completed','','2026-02-08 21:49:45.898470','Saldo check-out',NULL,'744c8af5db3a4161ba3123fd6d3cff5f','476c1022f1aa49fea378b03ee0eff06d'),('85bbb54301504b99b450b0aab8a33d1b','2026-02-08 21:49:45.888359','2026-02-08 21:49:45.888363',1000.00,'PEN','online','completed','','2026-02-08 21:49:45.888371','Pago Booking.com',NULL,'744c8af5db3a4161ba3123fd6d3cff5f','5f9d267db1b349669d4184031409fb70'),('8f8278db895742aea9eb474794701328','2026-02-08 21:49:45.900232','2026-02-08 21:49:45.900237',420.00,'PEN','card','completed','','2026-02-08 21:49:45.900245','',NULL,'744c8af5db3a4161ba3123fd6d3cff5f','93028476f41044bc97bf40b37739bfe2'),('fa4e35c81f914dd4b95ac82c6b860a15','2026-02-08 21:49:45.889982','2026-02-08 21:49:45.889987',300.00,'PEN','transfer','completed','','2026-02-08 21:49:45.889994','',NULL,'744c8af5db3a4161ba3123fd6d3cff5f','5c5ecda51c72449f8a98c448904a9339');
/*!40000 ALTER TABLE `reservations_payment` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `reservations_reservation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservations_reservation` (
  `id` char(32) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `confirmation_code` varchar(10) NOT NULL,
  `check_in_date` date NOT NULL,
  `check_out_date` date NOT NULL,
  `adults` smallint unsigned NOT NULL,
  `children` smallint unsigned NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) NOT NULL,
  `operational_status` varchar(20) NOT NULL,
  `financial_status` varchar(20) NOT NULL,
  `origin_type` varchar(20) NOT NULL,
  `origin_metadata` json NOT NULL,
  `special_requests` longtext NOT NULL,
  `created_by_id` char(32) DEFAULT NULL,
  `guest_id` char(32) NOT NULL,
  `organization_id` char(32) NOT NULL,
  `property_id` char(32) NOT NULL,
  `requested_bed_configuration_id` char(32) DEFAULT NULL,
  `room_id` char(32) DEFAULT NULL,
  `room_type_id` char(32) NOT NULL,
  `payment_deadline` datetime(6) DEFAULT NULL,
  `voucher_image` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `confirmation_code` (`confirmation_code`),
  KEY `reservations_reservation_created_by_id_c9002bab_fk_users_user_id` (`created_by_id`),
  KEY `reservations_reservation_guest_id_c59ab314_fk_guests_guest_id` (`guest_id`),
  KEY `reservations_reserva_organization_id_95b377b8_fk_organizat` (`organization_id`),
  KEY `reservations_reserva_property_id_be19c1de_fk_organizat` (`property_id`),
  KEY `reservations_reserva_requested_bed_config_2cbbdaed_fk_rooms_bed` (`requested_bed_configuration_id`),
  KEY `reservations_reservation_room_id_f7d9ba76_fk_rooms_room_id` (`room_id`),
  KEY `reservations_reserva_room_type_id_659fd483_fk_rooms_roo` (`room_type_id`),
  CONSTRAINT `reservations_reserva_organization_id_95b377b8_fk_organizat` FOREIGN KEY (`organization_id`) REFERENCES `organizations_organization` (`id`),
  CONSTRAINT `reservations_reserva_property_id_be19c1de_fk_organizat` FOREIGN KEY (`property_id`) REFERENCES `organizations_property` (`id`),
  CONSTRAINT `reservations_reserva_requested_bed_config_2cbbdaed_fk_rooms_bed` FOREIGN KEY (`requested_bed_configuration_id`) REFERENCES `rooms_bedconfiguration` (`id`),
  CONSTRAINT `reservations_reserva_room_type_id_659fd483_fk_rooms_roo` FOREIGN KEY (`room_type_id`) REFERENCES `rooms_roomtype` (`id`),
  CONSTRAINT `reservations_reservation_created_by_id_c9002bab_fk_users_user_id` FOREIGN KEY (`created_by_id`) REFERENCES `users_user` (`id`),
  CONSTRAINT `reservations_reservation_guest_id_c59ab314_fk_guests_guest_id` FOREIGN KEY (`guest_id`) REFERENCES `guests_guest` (`id`),
  CONSTRAINT `reservations_reservation_room_id_f7d9ba76_fk_rooms_room_id` FOREIGN KEY (`room_id`) REFERENCES `rooms_room` (`id`),
  CONSTRAINT `reservations_reservation_chk_1` CHECK ((`adults` >= 0)),
  CONSTRAINT `reservations_reservation_chk_2` CHECK ((`children` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `reservations_reservation` WRITE;
/*!40000 ALTER TABLE `reservations_reservation` DISABLE KEYS */;
INSERT INTO `reservations_reservation` VALUES ('0504abed0d914550a4939a5e87ba1078','2026-02-08 21:49:45.893726','2026-02-08 21:49:45.893734','5CBFA083','2026-02-13','2026-02-16',1,0,540.00,'PEN','pending','pending_payment','website','{}','',NULL,'6c8c4532587f4b4a8785f619cddb8553','744c8af5db3a4161ba3123fd6d3cff5f','4a248d0e510046688aaf246a9763137c',NULL,NULL,'0a27ca3f90d6409c8412002f3bf374ca',NULL,''),('097e642b2408493aa9069c0c78924b95','2026-02-08 21:49:45.895412','2026-02-08 21:49:45.895429','64475885','2026-02-03','2026-02-06',1,0,360.00,'PEN','check_out','paid','walk_in','{}','',NULL,'9e9eca86cb874881b306956e1a764210','744c8af5db3a4161ba3123fd6d3cff5f','4a248d0e510046688aaf246a9763137c',NULL,NULL,'344eb7a148de48589bcbec6a8d250c61',NULL,''),('0e7332a156164aa5bf5df3b9720fbfe2','2026-02-08 21:49:45.894411','2026-02-08 21:49:45.894417','890728A0','2026-02-15','2026-02-18',1,0,600.00,'PEN','pending','pending_payment','phone','{}','',NULL,'7c08364bdab04d50bc4cc48c40c75b39','744c8af5db3a4161ba3123fd6d3cff5f','4a248d0e510046688aaf246a9763137c',NULL,NULL,'f9cce7b98053481eb61ac24313f482aa',NULL,''),('31b6d7c68a57420890dd8ec2e28ca489','2026-02-08 21:49:45.891775','2026-02-08 21:49:45.891780','0D08E14A','2026-02-10','2026-02-13',1,0,450.00,'PEN','confirmed','paid','website','{}','',NULL,'851bfc8a338d4ac3b45f15f5ec7f4a0d','744c8af5db3a4161ba3123fd6d3cff5f','4a248d0e510046688aaf246a9763137c',NULL,NULL,'77a9f9a0ca2f44bfb9c713283b25f0bf',NULL,''),('35856a692aa140c1a13d7689eb75cfc0','2026-02-08 21:49:45.882935','2026-02-08 21:49:45.882943','0E436F63','2026-02-06','2026-02-09',1,0,240.00,'PEN','check_in','paid','walk_in','{}','',NULL,'5e06278b638a4ca4a1fbb6cf81ae4a8a','744c8af5db3a4161ba3123fd6d3cff5f','4a248d0e510046688aaf246a9763137c',NULL,NULL,'344eb7a148de48589bcbec6a8d250c61',NULL,''),('39803797117a4e3588d8011ab9355158','2026-02-08 21:49:45.885690','2026-02-08 21:49:45.885696','07082000','2026-02-07','2026-02-11',2,0,720.00,'PEN','check_in','partial','website','{}','',NULL,'7e72fe4656e644c59391140c91199a54','744c8af5db3a4161ba3123fd6d3cff5f','4a248d0e510046688aaf246a9763137c',NULL,NULL,'0a27ca3f90d6409c8412002f3bf374ca',NULL,''),('476c1022f1aa49fea378b03ee0eff06d','2026-02-08 21:49:45.897381','2026-02-08 21:49:45.897386','343FFE8F','2026-02-04','2026-02-07',1,0,450.00,'PEN','check_out','paid','ota','{}','',NULL,'73810be675f24aad9128a2cd9fe58496','744c8af5db3a4161ba3123fd6d3cff5f','4a248d0e510046688aaf246a9763137c',NULL,NULL,'77a9f9a0ca2f44bfb9c713283b25f0bf',NULL,''),('5c5ecda51c72449f8a98c448904a9339','2026-02-08 21:49:45.889404','2026-02-08 21:49:45.889409','10094EB2','2026-02-08','2026-02-12',1,0,600.00,'PEN','check_in','partial','phone','{}','',NULL,'ed83d5c195c044518592e76eb553e273','744c8af5db3a4161ba3123fd6d3cff5f','4a248d0e510046688aaf246a9763137c',NULL,NULL,'77a9f9a0ca2f44bfb9c713283b25f0bf',NULL,''),('5f9d267db1b349669d4184031409fb70','2026-02-08 21:49:45.887645','2026-02-08 21:49:45.887650','4EE78501','2026-02-05','2026-02-10',2,0,1000.00,'PEN','check_in','paid','ota','{}','',NULL,'f3945a0bf44640b091981a9021fac80f','744c8af5db3a4161ba3123fd6d3cff5f','4a248d0e510046688aaf246a9763137c',NULL,NULL,'f9cce7b98053481eb61ac24313f482aa',NULL,''),('6bbde4fa8a01492586536f6e646a463e','2026-02-08 21:49:45.892952','2026-02-08 21:49:45.892956','426AE9AA','2026-02-11','2026-02-14',1,0,420.00,'PEN','confirmed','pending_payment','ota','{}','',NULL,'997b93d047f3413ba6ba324bd53432d7','744c8af5db3a4161ba3123fd6d3cff5f','4a248d0e510046688aaf246a9763137c',NULL,NULL,'856d19a47100465da85350dd853b66de',NULL,''),('7ea4278722164dddb89b11e2e0fdbca9','2026-02-08 21:49:45.901267','2026-02-08 21:49:45.901272','3BCDC5BD','2026-02-18','2026-02-21',1,0,420.00,'PEN','cancelled','pending_payment','website','{}','',NULL,'6c8c4532587f4b4a8785f619cddb8553','744c8af5db3a4161ba3123fd6d3cff5f','4a248d0e510046688aaf246a9763137c',NULL,NULL,'cd50c3cd2f4e41d59e6b011b35507e66',NULL,''),('93028476f41044bc97bf40b37739bfe2','2026-02-08 21:49:45.899653','2026-02-08 21:49:45.899657','6911452D','2026-02-05','2026-02-08',2,0,420.00,'PEN','check_out','paid','website','{}','',NULL,'11a58ecfddba4c4094a51b78d9d3fc51','744c8af5db3a4161ba3123fd6d3cff5f','4a248d0e510046688aaf246a9763137c',NULL,NULL,'856d19a47100465da85350dd853b66de',NULL,''),('c88103d8e9c747d0ae0d15e4ae410b1e','2026-02-08 21:49:45.901959','2026-02-08 21:49:45.901964','04F11A72','2026-02-07','2026-02-10',1,0,360.00,'PEN','no_show','pending_payment','phone','{}','',NULL,'7c08364bdab04d50bc4cc48c40c75b39','744c8af5db3a4161ba3123fd6d3cff5f','4a248d0e510046688aaf246a9763137c',NULL,NULL,'344eb7a148de48589bcbec6a8d250c61',NULL,''),('c9ec9fb6fb74445d9c274a0dd9fc30ac','2026-02-08 21:49:45.891131','2026-02-08 21:49:45.891136','691BD013','2026-02-09','2026-02-12',1,0,420.00,'PEN','confirmed','pending_payment','website','{}','',NULL,'a2917f270ce545e582f088c0af3d5189','744c8af5db3a4161ba3123fd6d3cff5f','4a248d0e510046688aaf246a9763137c',NULL,NULL,'cd50c3cd2f4e41d59e6b011b35507e66',NULL,'');
/*!40000 ALTER TABLE `reservations_reservation` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `rooms_bedconfiguration`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rooms_bedconfiguration` (
  `id` char(32) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `name` varchar(100) NOT NULL,
  `room_type_id` char(32) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `rooms_bedconfigurati_room_type_id_adc172d8_fk_rooms_roo` (`room_type_id`),
  CONSTRAINT `rooms_bedconfigurati_room_type_id_adc172d8_fk_rooms_roo` FOREIGN KEY (`room_type_id`) REFERENCES `rooms_roomtype` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `rooms_bedconfiguration` WRITE;
/*!40000 ALTER TABLE `rooms_bedconfiguration` DISABLE KEYS */;
INSERT INTO `rooms_bedconfiguration` VALUES ('02016a10baf643e7afdc00243b59c953','2026-02-08 22:11:17.183316','2026-02-08 22:11:17.183364','Dos camas dobles','856d19a47100465da85350dd853b66de'),('02b46c16765f427db75ef3a1c1c60d62','2026-02-08 21:49:04.092629','2026-02-08 21:49:04.092634','Estándar','cd50c3cd2f4e41d59e6b011b35507e66'),('5b98bbaf21f147108973b6df6df302f9','2026-02-08 21:49:04.089888','2026-02-08 21:49:04.089895','Estándar','344eb7a148de48589bcbec6a8d250c61'),('66105b12342b4154b36ed2b84356aea0','2026-02-08 21:49:04.096628','2026-02-08 21:49:04.096633','Tres camas','f9cce7b98053481eb61ac24313f482aa'),('b0312bc83d6446c78433c79d7d118b3e','2026-02-08 21:49:04.091323','2026-02-08 21:49:04.091328','Queen','77a9f9a0ca2f44bfb9c713283b25f0bf'),('d99648006dbc41b8bc57c031a790478a','2026-02-08 21:49:04.093890','2026-02-08 21:49:04.093894','King','0a27ca3f90d6409c8412002f3bf374ca');
/*!40000 ALTER TABLE `rooms_bedconfiguration` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `rooms_bedconfigurationdetail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rooms_bedconfigurationdetail` (
  `id` char(32) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `bed_type` varchar(20) NOT NULL,
  `quantity` smallint unsigned NOT NULL,
  `bed_configuration_id` char(32) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `rooms_bedconfigurati_bed_configuration_id_975a2b4b_fk_rooms_bed` (`bed_configuration_id`),
  CONSTRAINT `rooms_bedconfigurati_bed_configuration_id_975a2b4b_fk_rooms_bed` FOREIGN KEY (`bed_configuration_id`) REFERENCES `rooms_bedconfiguration` (`id`),
  CONSTRAINT `rooms_bedconfigurationdetail_chk_1` CHECK ((`quantity` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `rooms_bedconfigurationdetail` WRITE;
/*!40000 ALTER TABLE `rooms_bedconfigurationdetail` DISABLE KEYS */;
INSERT INTO `rooms_bedconfigurationdetail` VALUES ('08e8a853d89141d79751d5e4d1597edd','2026-02-08 21:49:04.091684','2026-02-08 21:49:04.091688','queen',1,'b0312bc83d6446c78433c79d7d118b3e'),('54c7e2b946584b2ebb5b1edb4c408f3b','2026-02-08 21:49:04.093072','2026-02-08 21:49:04.093077','king',1,'02b46c16765f427db75ef3a1c1c60d62'),('554c65558a244c958647e620d84ab624','2026-02-08 21:49:04.096978','2026-02-08 21:49:04.096982','single',3,'66105b12342b4154b36ed2b84356aea0'),('69807ffbc9a3443e8b7410a249be2499','2026-02-08 21:49:04.090368','2026-02-08 21:49:04.090377','queen',1,'5b98bbaf21f147108973b6df6df302f9'),('732301012a0c4a0aa3aebb47ff9b32cf','2026-02-08 22:11:17.194648','2026-02-08 22:11:17.194696','double',2,'02016a10baf643e7afdc00243b59c953'),('b484b6a0e9d4443c9009a11a0d938952','2026-02-08 21:49:04.094309','2026-02-08 21:49:04.094313','king',1,'d99648006dbc41b8bc57c031a790478a');
/*!40000 ALTER TABLE `rooms_bedconfigurationdetail` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `rooms_room`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rooms_room` (
  `id` char(32) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `number` varchar(20) NOT NULL,
  `floor` varchar(10) NOT NULL,
  `status` varchar(20) NOT NULL,
  `active_bed_configuration_id` char(32) DEFAULT NULL,
  `property_id` char(32) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rooms_room_property_id_number_73791e12_uniq` (`property_id`,`number`),
  KEY `rooms_room_active_bed_configura_7233e1d9_fk_rooms_bed` (`active_bed_configuration_id`),
  CONSTRAINT `rooms_room_active_bed_configura_7233e1d9_fk_rooms_bed` FOREIGN KEY (`active_bed_configuration_id`) REFERENCES `rooms_bedconfiguration` (`id`),
  CONSTRAINT `rooms_room_property_id_e6589c59_fk_organizations_property_id` FOREIGN KEY (`property_id`) REFERENCES `organizations_property` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `rooms_room` WRITE;
/*!40000 ALTER TABLE `rooms_room` DISABLE KEYS */;
INSERT INTO `rooms_room` VALUES ('06af995dc74940d3aca792c1c2e21512','2026-02-08 22:40:09.720602','2026-02-08 22:40:09.720607','213','2','available',NULL,'4a248d0e510046688aaf246a9763137c'),('0748127d0abf4615afdd34e77f84bf3e','2026-02-08 22:40:09.741222','2026-02-08 22:40:09.741227','310','3','available',NULL,'4a248d0e510046688aaf246a9763137c'),('1461e90146aa46f39fd27b74335c4d42','2026-02-08 22:40:09.750547','2026-02-08 22:40:09.750557','400','4','available',NULL,'4a248d0e510046688aaf246a9763137c'),('1ad031ffc3ce4b389a77293ac7b5e325','2026-02-08 22:40:09.745587','2026-02-08 22:40:09.745592','313','3','available',NULL,'4a248d0e510046688aaf246a9763137c'),('1ae76ba873a1410dbcbea4c911377d00','2026-02-08 22:40:09.764747','2026-02-08 22:40:09.764754','409','4','available',NULL,'4a248d0e510046688aaf246a9763137c'),('234fbf98a98c473487f8c475ce3f7cc1','2026-02-08 22:40:09.700991','2026-02-08 22:40:09.701005','202','2','available',NULL,'4a248d0e510046688aaf246a9763137c'),('25b7f610efa243148b4cd0ad7cc1d9bc','2026-02-08 22:40:09.721975','2026-02-08 22:40:09.721981','214','2','available',NULL,'4a248d0e510046688aaf246a9763137c'),('27e9b78c96024032a306ddf221c569f2','2026-02-08 22:40:09.713723','2026-02-08 22:40:09.713731','209','2','available',NULL,'4a248d0e510046688aaf246a9763137c'),('29afd39942ae488991f614bda0cb45d9','2026-02-08 22:40:09.725715','2026-02-08 22:40:09.725726','300','3','available',NULL,'4a248d0e510046688aaf246a9763137c'),('3fbad1fd8e694f0685ebf02a61bab0d1','2026-02-08 22:40:09.716990','2026-02-08 22:40:09.716998','211','2','available',NULL,'4a248d0e510046688aaf246a9763137c'),('4b1a669effa64fd6bf633d31e0974a33','2026-02-08 22:40:09.730246','2026-02-08 22:40:09.730252','303','3','available',NULL,'4a248d0e510046688aaf246a9763137c'),('4c598d30369541bb8ce48c74b027d71e','2026-02-08 22:40:09.710237','2026-02-08 22:40:09.710247','207','2','available',NULL,'4a248d0e510046688aaf246a9763137c'),('4ecd849d700a4ca499d6eff1855b220c','2026-02-08 22:40:09.769197','2026-02-08 22:40:09.769203','412','4','available',NULL,'4a248d0e510046688aaf246a9763137c'),('4f945c34e24444959c35f0319237b863','2026-02-08 22:40:09.739781','2026-02-08 22:40:09.739786','309','3','available',NULL,'4a248d0e510046688aaf246a9763137c'),('513d95ea603043f58b7928bb4da7d188','2026-02-08 22:40:09.704801','2026-02-08 22:40:09.704809','204','2','available',NULL,'4a248d0e510046688aaf246a9763137c'),('542e82fc10914e9bbb380d1ccbf245f3','2026-02-08 22:40:09.753388','2026-02-08 22:40:09.753393','402','4','available',NULL,'4a248d0e510046688aaf246a9763137c'),('5757c3bb118b4245adf6815e48d7fa1b','2026-02-08 22:40:09.697844','2026-02-08 22:40:09.697862','201','2','available',NULL,'4a248d0e510046688aaf246a9763137c'),('582d51e2dcd2409eb26eee065bfe89f6','2026-02-08 22:40:09.733983','2026-02-08 22:40:09.733990','305','3','available',NULL,'4a248d0e510046688aaf246a9763137c'),('5d88b2dc043d4bc7b5834fd838f9bb52','2026-02-08 22:40:09.752068','2026-02-08 22:40:09.752073','401','4','available',NULL,'4a248d0e510046688aaf246a9763137c'),('64e2e7d27bf24e1e86b5ea70dbeebc4d','2026-02-08 22:40:09.715361','2026-02-08 22:40:09.715371','210','2','available',NULL,'4a248d0e510046688aaf246a9763137c'),('690aa4811e7c4208ad89ea3cf92f6eee','2026-02-08 22:40:09.772616','2026-02-08 22:40:09.772624','414','4','available',NULL,'4a248d0e510046688aaf246a9763137c'),('6b371fd0dc254db481ec5503dee89439','2026-02-08 22:40:09.770882','2026-02-08 22:40:09.770889','413','4','available',NULL,'4a248d0e510046688aaf246a9763137c'),('70d245ce319f42b6a5cc5ec7636d509f','2026-02-08 22:40:09.742700','2026-02-08 22:40:09.742707','311','3','available',NULL,'4a248d0e510046688aaf246a9763137c'),('73b2dffb189341d698bb57ceaaaa7ca2','2026-02-08 22:40:09.738250','2026-02-08 22:40:09.738255','308','3','available',NULL,'4a248d0e510046688aaf246a9763137c'),('768f8396b5e54a299f9df216c452cd34','2026-02-08 22:40:09.708447','2026-02-08 22:40:09.708459','206','2','available',NULL,'4a248d0e510046688aaf246a9763137c'),('772a5f56803e483bb5b98a931eb9648a','2026-02-08 22:40:09.766202','2026-02-08 22:40:09.766208','410','4','available',NULL,'4a248d0e510046688aaf246a9763137c'),('7f4b9ae5158340edbbfb25b702e97351','2026-02-08 22:40:09.718895','2026-02-08 22:40:09.718900','212','2','available',NULL,'4a248d0e510046688aaf246a9763137c'),('83a292c8c2c14ab3866acd78d16cfc78','2026-02-08 22:40:09.748951','2026-02-08 22:40:09.748956','315','3','available',NULL,'4a248d0e510046688aaf246a9763137c'),('8d2b20f6dd3744d7835eaac881b91bfb','2026-02-08 22:40:09.756545','2026-02-08 22:40:09.756552','404','4','available',NULL,'4a248d0e510046688aaf246a9763137c'),('9e446c412a9542ed9ffa543e81c05169','2026-02-08 22:40:09.761815','2026-02-08 22:40:09.761821','407','4','available',NULL,'4a248d0e510046688aaf246a9763137c'),('a69b68d25a5d4e25abf0c256fd5d10a0','2026-02-08 22:40:09.736898','2026-02-08 22:40:09.736903','307','3','available',NULL,'4a248d0e510046688aaf246a9763137c'),('aafbf1969244475faea27012569667dd','2026-02-08 22:40:09.744096','2026-02-10 14:27:21.312633','312','3','maintenance',NULL,'4a248d0e510046688aaf246a9763137c'),('b971ea093f2a4c46b3a00198d9e9b1d5','2026-02-08 22:40:09.763362','2026-02-08 22:40:09.763367','408','4','available',NULL,'4a248d0e510046688aaf246a9763137c'),('c2b0fca2995e401cb4b4706bbf655fee','2026-02-08 22:40:09.712115','2026-02-08 22:40:09.712124','208','2','available',NULL,'4a248d0e510046688aaf246a9763137c'),('c2c8e0a55a494f52a5587c217ede1d5e','2026-02-08 22:40:09.727244','2026-02-08 22:40:09.727252','301','3','available',NULL,'4a248d0e510046688aaf246a9763137c'),('c4b2c0591b924b56abceb2edc78a9221','2026-02-08 22:40:09.754889','2026-02-08 22:40:09.754895','403','4','available',NULL,'4a248d0e510046688aaf246a9763137c'),('c4b60c0531c346709bf4dcee362c2436','2026-02-08 22:40:09.767750','2026-02-08 22:40:09.767755','411','4','available',NULL,'4a248d0e510046688aaf246a9763137c'),('c888bb844c73410f852416d49c9242f8','2026-02-08 22:40:09.706578','2026-02-08 22:40:09.706590','205','2','available',NULL,'4a248d0e510046688aaf246a9763137c'),('c96b960478db49d2a870795f489f33ae','2026-02-08 22:40:09.774609','2026-02-08 22:40:09.774615','415','4','available',NULL,'4a248d0e510046688aaf246a9763137c'),('cc7121861e79400da99d48f6de0799a0','2026-02-08 22:40:09.732074','2026-02-08 22:40:09.732080','304','3','available',NULL,'4a248d0e510046688aaf246a9763137c'),('d3205122b7824d9096732af10265869e','2026-02-08 22:40:09.747020','2026-02-08 22:40:09.747025','314','3','available',NULL,'4a248d0e510046688aaf246a9763137c'),('d6a29c8f00e84fe2acae472ed7d4b64c','2026-02-08 22:40:09.723806','2026-02-08 22:40:09.723810','215','2','available',NULL,'4a248d0e510046688aaf246a9763137c'),('d7271b86664c42b486114c7be1f7a254','2026-02-08 22:40:09.702753','2026-02-08 22:40:09.702763','203','2','available',NULL,'4a248d0e510046688aaf246a9763137c'),('db9a4789c38145a7a047dc910666575e','2026-02-08 22:40:09.758422','2026-02-08 22:40:09.758428','405','4','available',NULL,'4a248d0e510046688aaf246a9763137c'),('ec8ae62851e446e3995ac8bad96d468d','2026-02-08 22:40:09.760133','2026-02-08 22:40:09.760141','406','4','available',NULL,'4a248d0e510046688aaf246a9763137c'),('f73c759d6b24447886fc1b875db3165f','2026-02-08 22:40:09.728823','2026-02-08 22:40:09.728829','302','3','available',NULL,'4a248d0e510046688aaf246a9763137c'),('ff0fa307702241369c1b860daae2051e','2026-02-08 22:40:09.735520','2026-02-08 22:40:09.735526','306','3','available',NULL,'4a248d0e510046688aaf246a9763137c');
/*!40000 ALTER TABLE `rooms_room` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `rooms_room_room_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rooms_room_room_types` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `room_id` char(32) NOT NULL,
  `roomtype_id` char(32) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rooms_room_room_types_room_id_roomtype_id_df903650_uniq` (`room_id`,`roomtype_id`),
  KEY `rooms_room_room_types_roomtype_id_1e7f88aa_fk_rooms_roomtype_id` (`roomtype_id`),
  CONSTRAINT `rooms_room_room_types_room_id_ca2abbac_fk_rooms_room_id` FOREIGN KEY (`room_id`) REFERENCES `rooms_room` (`id`),
  CONSTRAINT `rooms_room_room_types_roomtype_id_1e7f88aa_fk_rooms_roomtype_id` FOREIGN KEY (`roomtype_id`) REFERENCES `rooms_roomtype` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `rooms_room_room_types` WRITE;
/*!40000 ALTER TABLE `rooms_room_room_types` DISABLE KEYS */;
INSERT INTO `rooms_room_room_types` VALUES (39,'06af995dc74940d3aca792c1c2e21512','344eb7a148de48589bcbec6a8d250c61'),(38,'06af995dc74940d3aca792c1c2e21512','77a9f9a0ca2f44bfb9c713283b25f0bf'),(61,'0748127d0abf4615afdd34e77f84bf3e','344eb7a148de48589bcbec6a8d250c61'),(60,'0748127d0abf4615afdd34e77f84bf3e','77a9f9a0ca2f44bfb9c713283b25f0bf'),(72,'1461e90146aa46f39fd27b74335c4d42','344eb7a148de48589bcbec6a8d250c61'),(71,'1461e90146aa46f39fd27b74335c4d42','77a9f9a0ca2f44bfb9c713283b25f0bf'),(66,'1ad031ffc3ce4b389a77293ac7b5e325','f9cce7b98053481eb61ac24313f482aa'),(87,'1ae76ba873a1410dbcbea4c911377d00','0a27ca3f90d6409c8412002f3bf374ca'),(88,'1ae76ba873a1410dbcbea4c911377d00','cd50c3cd2f4e41d59e6b011b35507e66'),(18,'234fbf98a98c473487f8c475ce3f7cc1','856d19a47100465da85350dd853b66de'),(40,'25b7f610efa243148b4cd0ad7cc1d9bc','0a27ca3f90d6409c8412002f3bf374ca'),(41,'25b7f610efa243148b4cd0ad7cc1d9bc','cd50c3cd2f4e41d59e6b011b35507e66'),(30,'27e9b78c96024032a306ddf221c569f2','0a27ca3f90d6409c8412002f3bf374ca'),(31,'27e9b78c96024032a306ddf221c569f2','cd50c3cd2f4e41d59e6b011b35507e66'),(45,'29afd39942ae488991f614bda0cb45d9','344eb7a148de48589bcbec6a8d250c61'),(44,'29afd39942ae488991f614bda0cb45d9','77a9f9a0ca2f44bfb9c713283b25f0bf'),(35,'3fbad1fd8e694f0685ebf02a61bab0d1','344eb7a148de48589bcbec6a8d250c61'),(34,'3fbad1fd8e694f0685ebf02a61bab0d1','77a9f9a0ca2f44bfb9c713283b25f0bf'),(49,'4b1a669effa64fd6bf633d31e0974a33','344eb7a148de48589bcbec6a8d250c61'),(48,'4b1a669effa64fd6bf633d31e0974a33','77a9f9a0ca2f44bfb9c713283b25f0bf'),(27,'4c598d30369541bb8ce48c74b027d71e','344eb7a148de48589bcbec6a8d250c61'),(26,'4c598d30369541bb8ce48c74b027d71e','77a9f9a0ca2f44bfb9c713283b25f0bf'),(94,'4ecd849d700a4ca499d6eff1855b220c','344eb7a148de48589bcbec6a8d250c61'),(93,'4ecd849d700a4ca499d6eff1855b220c','77a9f9a0ca2f44bfb9c713283b25f0bf'),(58,'4f945c34e24444959c35f0319237b863','0a27ca3f90d6409c8412002f3bf374ca'),(59,'4f945c34e24444959c35f0319237b863','cd50c3cd2f4e41d59e6b011b35507e66'),(21,'513d95ea603043f58b7928bb4da7d188','856d19a47100465da85350dd853b66de'),(75,'542e82fc10914e9bbb380d1ccbf245f3','344eb7a148de48589bcbec6a8d250c61'),(74,'542e82fc10914e9bbb380d1ccbf245f3','77a9f9a0ca2f44bfb9c713283b25f0bf'),(17,'5757c3bb118b4245adf6815e48d7fa1b','344eb7a148de48589bcbec6a8d250c61'),(16,'5757c3bb118b4245adf6815e48d7fa1b','77a9f9a0ca2f44bfb9c713283b25f0bf'),(51,'582d51e2dcd2409eb26eee065bfe89f6','f9cce7b98053481eb61ac24313f482aa'),(73,'5d88b2dc043d4bc7b5834fd838f9bb52','856d19a47100465da85350dd853b66de'),(33,'64e2e7d27bf24e1e86b5ea70dbeebc4d','344eb7a148de48589bcbec6a8d250c61'),(32,'64e2e7d27bf24e1e86b5ea70dbeebc4d','77a9f9a0ca2f44bfb9c713283b25f0bf'),(96,'690aa4811e7c4208ad89ea3cf92f6eee','0a27ca3f90d6409c8412002f3bf374ca'),(97,'690aa4811e7c4208ad89ea3cf92f6eee','cd50c3cd2f4e41d59e6b011b35507e66'),(95,'6b371fd0dc254db481ec5503dee89439','f9cce7b98053481eb61ac24313f482aa'),(63,'70d245ce319f42b6a5cc5ec7636d509f','344eb7a148de48589bcbec6a8d250c61'),(62,'70d245ce319f42b6a5cc5ec7636d509f','77a9f9a0ca2f44bfb9c713283b25f0bf'),(56,'73b2dffb189341d698bb57ceaaaa7ca2','0a27ca3f90d6409c8412002f3bf374ca'),(57,'73b2dffb189341d698bb57ceaaaa7ca2','cd50c3cd2f4e41d59e6b011b35507e66'),(25,'768f8396b5e54a299f9df216c452cd34','344eb7a148de48589bcbec6a8d250c61'),(24,'768f8396b5e54a299f9df216c452cd34','77a9f9a0ca2f44bfb9c713283b25f0bf'),(90,'772a5f56803e483bb5b98a931eb9648a','344eb7a148de48589bcbec6a8d250c61'),(89,'772a5f56803e483bb5b98a931eb9648a','77a9f9a0ca2f44bfb9c713283b25f0bf'),(37,'7f4b9ae5158340edbbfb25b702e97351','344eb7a148de48589bcbec6a8d250c61'),(36,'7f4b9ae5158340edbbfb25b702e97351','77a9f9a0ca2f44bfb9c713283b25f0bf'),(69,'83a292c8c2c14ab3866acd78d16cfc78','0a27ca3f90d6409c8412002f3bf374ca'),(70,'83a292c8c2c14ab3866acd78d16cfc78','cd50c3cd2f4e41d59e6b011b35507e66'),(78,'8d2b20f6dd3744d7835eaac881b91bfb','856d19a47100465da85350dd853b66de'),(84,'9e446c412a9542ed9ffa543e81c05169','344eb7a148de48589bcbec6a8d250c61'),(83,'9e446c412a9542ed9ffa543e81c05169','77a9f9a0ca2f44bfb9c713283b25f0bf'),(55,'a69b68d25a5d4e25abf0c256fd5d10a0','344eb7a148de48589bcbec6a8d250c61'),(54,'a69b68d25a5d4e25abf0c256fd5d10a0','77a9f9a0ca2f44bfb9c713283b25f0bf'),(65,'aafbf1969244475faea27012569667dd','344eb7a148de48589bcbec6a8d250c61'),(64,'aafbf1969244475faea27012569667dd','77a9f9a0ca2f44bfb9c713283b25f0bf'),(85,'b971ea093f2a4c46b3a00198d9e9b1d5','0a27ca3f90d6409c8412002f3bf374ca'),(86,'b971ea093f2a4c46b3a00198d9e9b1d5','cd50c3cd2f4e41d59e6b011b35507e66'),(28,'c2b0fca2995e401cb4b4706bbf655fee','0a27ca3f90d6409c8412002f3bf374ca'),(29,'c2b0fca2995e401cb4b4706bbf655fee','cd50c3cd2f4e41d59e6b011b35507e66'),(46,'c2c8e0a55a494f52a5587c217ede1d5e','856d19a47100465da85350dd853b66de'),(77,'c4b2c0591b924b56abceb2edc78a9221','344eb7a148de48589bcbec6a8d250c61'),(76,'c4b2c0591b924b56abceb2edc78a9221','77a9f9a0ca2f44bfb9c713283b25f0bf'),(92,'c4b60c0531c346709bf4dcee362c2436','344eb7a148de48589bcbec6a8d250c61'),(91,'c4b60c0531c346709bf4dcee362c2436','77a9f9a0ca2f44bfb9c713283b25f0bf'),(23,'c888bb844c73410f852416d49c9242f8','344eb7a148de48589bcbec6a8d250c61'),(22,'c888bb844c73410f852416d49c9242f8','77a9f9a0ca2f44bfb9c713283b25f0bf'),(98,'c96b960478db49d2a870795f489f33ae','0a27ca3f90d6409c8412002f3bf374ca'),(99,'c96b960478db49d2a870795f489f33ae','cd50c3cd2f4e41d59e6b011b35507e66'),(50,'cc7121861e79400da99d48f6de0799a0','f9cce7b98053481eb61ac24313f482aa'),(67,'d3205122b7824d9096732af10265869e','0a27ca3f90d6409c8412002f3bf374ca'),(68,'d3205122b7824d9096732af10265869e','cd50c3cd2f4e41d59e6b011b35507e66'),(43,'d6a29c8f00e84fe2acae472ed7d4b64c','344eb7a148de48589bcbec6a8d250c61'),(42,'d6a29c8f00e84fe2acae472ed7d4b64c','77a9f9a0ca2f44bfb9c713283b25f0bf'),(20,'d7271b86664c42b486114c7be1f7a254','344eb7a148de48589bcbec6a8d250c61'),(19,'d7271b86664c42b486114c7be1f7a254','77a9f9a0ca2f44bfb9c713283b25f0bf'),(79,'db9a4789c38145a7a047dc910666575e','0a27ca3f90d6409c8412002f3bf374ca'),(80,'db9a4789c38145a7a047dc910666575e','cd50c3cd2f4e41d59e6b011b35507e66'),(82,'ec8ae62851e446e3995ac8bad96d468d','344eb7a148de48589bcbec6a8d250c61'),(81,'ec8ae62851e446e3995ac8bad96d468d','77a9f9a0ca2f44bfb9c713283b25f0bf'),(47,'f73c759d6b24447886fc1b875db3165f','856d19a47100465da85350dd853b66de'),(53,'ff0fa307702241369c1b860daae2051e','344eb7a148de48589bcbec6a8d250c61'),(52,'ff0fa307702241369c1b860daae2051e','77a9f9a0ca2f44bfb9c713283b25f0bf');
/*!40000 ALTER TABLE `rooms_room_room_types` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `rooms_roomtype`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rooms_roomtype` (
  `id` char(32) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `description` longtext NOT NULL,
  `max_adults` smallint unsigned NOT NULL,
  `max_children` smallint unsigned NOT NULL,
  `base_price` decimal(10,2) NOT NULL,
  `amenities` json NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `property_id` char(32) NOT NULL,
  `bathroom_type` varchar(50) NOT NULL,
  `highlights` json NOT NULL DEFAULT (_utf8mb4'[]'),
  `size_sqm` decimal(6,1) DEFAULT NULL,
  `view_type` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rooms_roomtype_property_id_slug_1412453d_uniq` (`property_id`,`slug`),
  KEY `rooms_roomtype_slug_3973cdd2` (`slug`),
  CONSTRAINT `rooms_roomtype_property_id_f626431b_fk_organizations_property_id` FOREIGN KEY (`property_id`) REFERENCES `organizations_property` (`id`),
  CONSTRAINT `rooms_roomtype_chk_1` CHECK ((`max_adults` >= 0)),
  CONSTRAINT `rooms_roomtype_chk_2` CHECK ((`max_children` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `rooms_roomtype` WRITE;
/*!40000 ALTER TABLE `rooms_roomtype` DISABLE KEYS */;
INSERT INTO `rooms_roomtype` VALUES ('0a27ca3f90d6409c8412002f3bf374ca','2026-02-08 21:49:04.093481','2026-02-09 11:06:03.675326','King Matrimonial','king-matrimonial','Nuestra habitación King Matrimonial combina amplitud y elegancia. Cama King extra confortable, vista parcial al océano y acabados de primera que hacen de cada momento un placer.',2,1,180.00,'[\"Wi-Fi\", \"TV cable\", \"Aire acondicionado\", \"Minibar premium\", \"Secador de pelo\", \"Caja fuerte\", \"Amenities L\'Occitane\", \"Escritorio\", \"Bata y pantuflas\", \"Máquina Nespresso\", \"Balcón\"]',1,'4a248d0e510046688aaf246a9763137c','private_tub','[\"Cama King\", \"Vista al mar\", \"Bañera\", \"Balcón privado\"]',30.0,'ocean'),('344eb7a148de48589bcbec6a8d250c61','2026-02-08 21:49:04.088940','2026-02-09 11:06:03.678112','Queen Personal','queen-personal','Habitación acogedora y funcional con cama Queen, ideal para viajeros individuales que buscan comodidad y buen precio. Diseño contemporáneo con acabados en madera y textiles peruanos.',1,0,120.00,'[\"Wi-Fi\", \"TV cable\", \"Aire acondicionado\", \"Minibar\", \"Secador de pelo\", \"Caja fuerte\", \"Amenities de baño\"]',1,'4a248d0e510046688aaf246a9763137c','private_shower','[\"Cama Queen\", \"Smart TV 43\\\"\", \"Minibar\", \"Caja fuerte\"]',18.0,'city'),('77a9f9a0ca2f44bfb9c713283b25f0bf','2026-02-08 21:49:04.090870','2026-02-09 11:06:03.677389','Queen Matrimonial','queen-matrimonial','Perfecta para parejas, esta habitación con cama Queen matrimonial ofrece un ambiente íntimo y relajante. Con iluminación cálida y detalles pensados para una estadía romántica.',2,1,150.00,'[\"Wi-Fi\", \"TV cable\", \"Aire acondicionado\", \"Minibar\", \"Secador de pelo\", \"Caja fuerte\", \"Amenities de baño\", \"Bata y pantuflas\"]',1,'4a248d0e510046688aaf246a9763137c','private_shower','[\"Cama Queen\", \"Iluminación ambiental\", \"Smart TV 43\\\"\", \"Minibar\"]',22.0,'city'),('856d19a47100465da85350dd853b66de','2026-02-08 21:49:04.094690','2026-02-09 11:06:03.674237','Doble','doble','Habitación con dos camas individuales, perfecta para amigos o compañeros de viaje. Amplia y luminosa, con todo lo necesario para una estadía confortable.',2,1,140.00,'[\"Wi-Fi\", \"TV cable\", \"Aire acondicionado\", \"Minibar\", \"Secador de pelo\", \"Caja fuerte\", \"Amenities de baño\", \"Escritorio\"]',1,'4a248d0e510046688aaf246a9763137c','private_shower','[\"2 camas individuales\", \"Smart TV 43\\\"\", \"Minibar\", \"Escritorio\"]',26.0,'city'),('cd50c3cd2f4e41d59e6b011b35507e66','2026-02-08 21:49:04.092045','2026-02-09 11:06:03.676314','King Personal','king-personal','Espaciosa habitación con cama King para el viajero que valora su espacio. Área de trabajo dedicada y vista a la ciudad. Ideal para estadías extendidas o viajeros de negocios.',1,0,140.00,'[\"Wi-Fi\", \"TV cable\", \"Aire acondicionado\", \"Minibar\", \"Secador de pelo\", \"Caja fuerte\", \"Amenities premium\", \"Escritorio\", \"Bata y pantuflas\"]',1,'4a248d0e510046688aaf246a9763137c','private_shower','[\"Cama King\", \"Escritorio ejecutivo\", \"Smart TV 50\\\"\", \"Vista ciudad\"]',25.0,'city'),('f9cce7b98053481eb61ac24313f482aa','2026-02-08 21:49:04.096006','2026-02-09 11:06:03.678717','Triple','triple','Espaciosa habitación para tres huéspedes con configuración flexible de camas. Ideal para familias pequeñas o grupos de amigos que buscan compartir sin sacrificar comodidad.',3,1,200.00,'[\"Wi-Fi\", \"TV cable\", \"Aire acondicionado\", \"Minibar\", \"Secador de pelo\", \"Caja fuerte\", \"Amenities de baño\", \"Escritorio\", \"Espejo de cuerpo completo\"]',1,'4a248d0e510046688aaf246a9763137c','private_shower','[\"3 camas o 1 King + 1 individual\", \"Smart TV 50\\\"\", \"Vista jardín\", \"Espacio amplio\"]',32.0,'garden');
/*!40000 ALTER TABLE `rooms_roomtype` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `rooms_roomtypephoto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rooms_roomtypephoto` (
  `id` char(32) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `caption` varchar(255) NOT NULL,
  `sort_order` smallint unsigned NOT NULL,
  `is_cover` tinyint(1) NOT NULL,
  `room_type_id` char(32) NOT NULL,
  `image` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `rooms_roomtypephoto_room_type_id_2885e389_fk_rooms_roomtype_id` (`room_type_id`),
  CONSTRAINT `rooms_roomtypephoto_room_type_id_2885e389_fk_rooms_roomtype_id` FOREIGN KEY (`room_type_id`) REFERENCES `rooms_roomtype` (`id`),
  CONSTRAINT `rooms_roomtypephoto_chk_1` CHECK ((`sort_order` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `rooms_roomtypephoto` WRITE;
/*!40000 ALTER TABLE `rooms_roomtypephoto` DISABLE KEYS */;
INSERT INTO `rooms_roomtypephoto` VALUES ('35e7071698d8420299df6a1e0ee95eba','2026-02-08 23:15:37.973071','2026-02-10 15:10:04.003409','Queen Matrimonial',1,1,'77a9f9a0ca2f44bfb9c713283b25f0bf','room_types/deluxe-queen.jpg'),('82fe11123c164cd096cf333a939fe760','2026-02-10 15:10:04.010909','2026-02-10 15:10:04.010917','Triple',1,1,'f9cce7b98053481eb61ac24313f482aa','room_types/triple.jpg'),('88f9a035c7ad4cacbe0f9fdcbf69b2ac','2026-02-10 15:10:04.008845','2026-02-10 15:10:04.008852','Doble',1,1,'856d19a47100465da85350dd853b66de','room_types/standard-double.jpg'),('9c047e623ea447c1a191c8e001e1ac32','2026-02-08 23:15:27.465605','2026-02-10 15:10:04.005278','King Personal',1,1,'cd50c3cd2f4e41d59e6b011b35507e66','room_types/single-king.jpg'),('ddf8f4ab3156499dbcec0a45af54b63b','2026-02-08 23:15:13.411384','2026-02-10 15:10:03.999221','King Matrimonial',1,1,'0a27ca3f90d6409c8412002f3bf374ca','room_types/suite-king.jpg'),('e307f520cac249f4b4084bf0f18421c4','2026-02-08 23:15:47.861505','2026-02-10 15:10:04.006762','Queen Personal',1,1,'344eb7a148de48589bcbec6a8d250c61','room_types/queen-personal.jpg');
/*!40000 ALTER TABLE `rooms_roomtypephoto` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `tasks_task`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tasks_task` (
  `id` char(32) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `task_type` varchar(20) NOT NULL,
  `assigned_role` varchar(20) NOT NULL,
  `priority` varchar(10) NOT NULL,
  `status` varchar(20) NOT NULL,
  `due_date` datetime(6) DEFAULT NULL,
  `notes` longtext NOT NULL,
  `result` longtext NOT NULL,
  `completed_at` datetime(6) DEFAULT NULL,
  `assigned_to_id` char(32) DEFAULT NULL,
  `created_by_id` char(32) DEFAULT NULL,
  `organization_id` char(32) NOT NULL,
  `property_id` char(32) NOT NULL,
  `room_id` char(32) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tasks_task_assigned_to_id_e8821f61_fk_users_user_id` (`assigned_to_id`),
  KEY `tasks_task_created_by_id_1345568a_fk_users_user_id` (`created_by_id`),
  KEY `tasks_task_organization_id_50c2ed4a_fk_organizat` (`organization_id`),
  KEY `tasks_task_property_id_fac6b772_fk_organizations_property_id` (`property_id`),
  KEY `tasks_task_room_id_8d192773_fk_rooms_room_id` (`room_id`),
  CONSTRAINT `tasks_task_assigned_to_id_e8821f61_fk_users_user_id` FOREIGN KEY (`assigned_to_id`) REFERENCES `users_user` (`id`),
  CONSTRAINT `tasks_task_created_by_id_1345568a_fk_users_user_id` FOREIGN KEY (`created_by_id`) REFERENCES `users_user` (`id`),
  CONSTRAINT `tasks_task_organization_id_50c2ed4a_fk_organizat` FOREIGN KEY (`organization_id`) REFERENCES `organizations_organization` (`id`),
  CONSTRAINT `tasks_task_property_id_fac6b772_fk_organizations_property_id` FOREIGN KEY (`property_id`) REFERENCES `organizations_property` (`id`),
  CONSTRAINT `tasks_task_room_id_8d192773_fk_rooms_room_id` FOREIGN KEY (`room_id`) REFERENCES `rooms_room` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `tasks_task` WRITE;
/*!40000 ALTER TABLE `tasks_task` DISABLE KEYS */;
INSERT INTO `tasks_task` VALUES ('0cd6ffc1631f46aab32cfc848c9b989b','2026-02-08 21:49:45.903186','2026-02-08 21:49:45.903190','cleaning','housekeeping','high','pending',NULL,'Check-out reciente, limpieza profunda.','',NULL,NULL,NULL,'744c8af5db3a4161ba3123fd6d3cff5f','4a248d0e510046688aaf246a9763137c',NULL),('1aced8819c0a49d3a278fb7ae7ad9a61','2026-02-08 21:49:45.904023','2026-02-08 21:49:45.904028','cleaning','housekeeping','normal','in_progress',NULL,'En proceso de limpieza.','',NULL,NULL,NULL,'744c8af5db3a4161ba3123fd6d3cff5f','4a248d0e510046688aaf246a9763137c',NULL),('69325e1ffa7a4c3aade66e22e29822aa','2026-02-08 21:49:45.905363','2026-02-08 21:49:45.905367','maintenance','maintenance','urgent','in_progress','2026-02-09 01:49:45.868466','Fuga de agua en baño. Plomero en camino.','',NULL,NULL,NULL,'744c8af5db3a4161ba3123fd6d3cff5f','4a248d0e510046688aaf246a9763137c',NULL),('a3529b5bdaf34f48b7f550653693782f','2026-02-08 21:49:45.904805','2026-02-08 21:49:45.904810','inspection','housekeeping','normal','pending',NULL,'Inspeccionar después de check-out.','',NULL,NULL,NULL,'744c8af5db3a4161ba3123fd6d3cff5f','4a248d0e510046688aaf246a9763137c',NULL),('c8385c86c19f4d02900ebce9130bb977','2026-02-08 21:49:45.906361','2026-02-08 21:49:45.906366','cleaning','housekeeping','normal','completed',NULL,'Limpieza de rutina.','Sin novedad.','2026-02-08 19:49:45.868466',NULL,NULL,'744c8af5db3a4161ba3123fd6d3cff5f','4a248d0e510046688aaf246a9763137c',NULL),('e9bdc46d478449f29b51e699974b9f26','2026-02-08 21:49:45.905864','2026-02-08 21:49:45.905869','bed_prep','housekeeping','normal','pending','2026-02-09 21:49:45.868466','Preparar para llegada mañana.','',NULL,NULL,NULL,'744c8af5db3a4161ba3123fd6d3cff5f','4a248d0e510046688aaf246a9763137c',NULL),('eaded2392bc64c6f8f35c0b80de0bb11','2026-02-08 21:49:45.906865','2026-02-08 21:49:45.906870','inspection','housekeeping','normal','completed',NULL,'Inspección post-limpieza.','Habitación lista.','2026-02-08 20:49:45.868466',NULL,NULL,'744c8af5db3a4161ba3123fd6d3cff5f','4a248d0e510046688aaf246a9763137c',NULL);
/*!40000 ALTER TABLE `tasks_task` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `token_blacklist_blacklistedtoken`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `token_blacklist_blacklistedtoken` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `blacklisted_at` datetime(6) NOT NULL,
  `token_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token_id` (`token_id`),
  CONSTRAINT `token_blacklist_blacklistedtoken_token_id_3cc7fe56_fk` FOREIGN KEY (`token_id`) REFERENCES `token_blacklist_outstandingtoken` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `token_blacklist_blacklistedtoken` WRITE;
/*!40000 ALTER TABLE `token_blacklist_blacklistedtoken` DISABLE KEYS */;
INSERT INTO `token_blacklist_blacklistedtoken` VALUES (1,'2026-02-08 22:19:11.124155',2),(2,'2026-02-08 23:13:25.737149',3),(3,'2026-02-08 23:56:16.561641',4),(4,'2026-02-09 10:38:58.357449',5),(5,'2026-02-09 11:10:53.887326',6),(6,'2026-02-09 16:44:07.062394',7),(7,'2026-02-10 14:27:02.850954',8),(8,'2026-02-10 15:44:28.140777',9),(9,'2026-02-11 10:30:29.551971',10),(10,'2026-02-11 16:34:00.543808',11),(11,'2026-02-12 05:09:42.614199',12),(12,'2026-02-12 06:29:39.828915',13);
/*!40000 ALTER TABLE `token_blacklist_blacklistedtoken` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `token_blacklist_outstandingtoken`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `token_blacklist_outstandingtoken` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `token` longtext NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `expires_at` datetime(6) NOT NULL,
  `user_id` char(32) DEFAULT NULL,
  `jti` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token_blacklist_outstandingtoken_jti_hex_d9bdf6f7_uniq` (`jti`),
  KEY `token_blacklist_outs_user_id_83bc629a_fk_users_use` (`user_id`),
  CONSTRAINT `token_blacklist_outs_user_id_83bc629a_fk_users_use` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `token_blacklist_outstandingtoken` WRITE;
/*!40000 ALTER TABLE `token_blacklist_outstandingtoken` DISABLE KEYS */;
INSERT INTO `token_blacklist_outstandingtoken` VALUES (1,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc3MTE5MTExNiwiaWF0IjoxNzcwNTg2MzE2LCJqdGkiOiJiZWU4YTRkYmI4NzI0NTFjYjVhNzRkMTE4NWU5OGY2NSIsInVzZXJfaWQiOiI1OWQ2NmU1Zi1hNmQ1LTRiZmEtOWU5ZS1hZGFkMmZlZDgxNzgifQ.dv8eOtEN8Q38A4xMp0uWCVd54YlLUYU_Os0RqcTLlkw','2026-02-08 21:31:56.133507','2026-02-15 21:31:56.000000','59d66e5fa6d54bfa9e9eadad2fed8178','bee8a4dbb872451cb5a74d1185e98f65'),(2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc3MTE5MjEzNiwiaWF0IjoxNzcwNTg3MzM2LCJqdGkiOiJlN2Y0NjE3Mjk3N2I0NDkxOTRhYWVjOGU1YjJjMzQ3MiIsInVzZXJfaWQiOiI1OWQ2NmU1Zi1hNmQ1LTRiZmEtOWU5ZS1hZGFkMmZlZDgxNzgifQ.eK3VjBVcaBN6QsUGVicTKt6n1KaDHS7SA6uLsII9Juo','2026-02-08 21:48:56.236394','2026-02-15 21:48:56.000000','59d66e5fa6d54bfa9e9eadad2fed8178','e7f46172977b449194aaec8e5b2c3472'),(3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc3MTE5Mzk1MSwiaWF0IjoxNzcwNTg5MTUxLCJqdGkiOiIyNTAzYjU0MTFkZjk0MjY4OTQ2NmU2MjhmMzYyNmJkMCIsInVzZXJfaWQiOiI1OWQ2NmU1Zi1hNmQ1LTRiZmEtOWU5ZS1hZGFkMmZlZDgxNzgiLCJvcmdhbml6YXRpb25faWQiOiI3NDRjOGFmNS1kYjNhLTQxNjEtYmEzMS0yM2ZkNmQzY2ZmNWYiLCJyb2xlIjoib3duZXIiLCJwcm9wZXJ0eV9pZHMiOlsiNGEyNDhkMGUtNTEwMC00NjY4LThhYWYtMjQ2YTk3NjMxMzdjIl0sImZ1bGxfbmFtZSI6IkF1c3RpbiBBZG1pbiJ9.DBG7YP2zpVfa2e4o7t-Zh6WUbvrCzezhIAOhNp1EYk4',NULL,'2026-02-15 22:19:11.000000',NULL,'2503b5411df942689466e628f3626bd0'),(4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc3MTE5NzIwNSwiaWF0IjoxNzcwNTkyNDA1LCJqdGkiOiIyMGYyMzI5MGViMjc0YTFiOTJmOGQ1OTRjZjQxMDRiNyIsInVzZXJfaWQiOiI1OWQ2NmU1Zi1hNmQ1LTRiZmEtOWU5ZS1hZGFkMmZlZDgxNzgiLCJvcmdhbml6YXRpb25faWQiOiI3NDRjOGFmNS1kYjNhLTQxNjEtYmEzMS0yM2ZkNmQzY2ZmNWYiLCJyb2xlIjoib3duZXIiLCJwcm9wZXJ0eV9pZHMiOlsiNGEyNDhkMGUtNTEwMC00NjY4LThhYWYtMjQ2YTk3NjMxMzdjIl0sImZ1bGxfbmFtZSI6IkF1c3RpbiBBZG1pbiJ9.cuRQQxQdVt9Yh6WMwVurBU-ee5tfdsxOx2gPtKwolUs',NULL,'2026-02-15 23:13:25.000000',NULL,'20f23290eb274a1b92f8d594cf4104b7'),(5,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc3MTIzMjUzMSwiaWF0IjoxNzcwNjI3NzMxLCJqdGkiOiI3OGVmZTQxM2IyNTI0YjhmODJhODlhZjIxMzhiMDcxZCIsInVzZXJfaWQiOiI1OWQ2NmU1Zi1hNmQ1LTRiZmEtOWU5ZS1hZGFkMmZlZDgxNzgifQ.XZUtlRjJ2TZPmvQSw0npwU9Nz1e3nkzxbPiUBsKilDY','2026-02-09 09:02:11.004703','2026-02-16 09:02:11.000000','59d66e5fa6d54bfa9e9eadad2fed8178','78efe413b2524b8f82a89af2138b071d'),(6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc3MTIzODMzOCwiaWF0IjoxNzcwNjMzNTM4LCJqdGkiOiI0MWY3NzZkNjNiMzk0Mzk0ODY2NDhlNWI5ZTUxNDJlMSIsInVzZXJfaWQiOiI1OWQ2NmU1Zi1hNmQ1LTRiZmEtOWU5ZS1hZGFkMmZlZDgxNzgiLCJvcmdhbml6YXRpb25faWQiOiI3NDRjOGFmNS1kYjNhLTQxNjEtYmEzMS0yM2ZkNmQzY2ZmNWYiLCJyb2xlIjoib3duZXIiLCJwcm9wZXJ0eV9pZHMiOlsiNGEyNDhkMGUtNTEwMC00NjY4LThhYWYtMjQ2YTk3NjMxMzdjIl0sImZ1bGxfbmFtZSI6IkF1c3RpbiBBZG1pbiJ9.8pVycivN0cm8lr1RQWzXYLfHvLlqYT5y901ohxh0N0I',NULL,'2026-02-16 10:38:58.000000',NULL,'41f776d63b39439486648e5b9e5142e1'),(7,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc3MTI0MDI1MywiaWF0IjoxNzcwNjM1NDUzLCJqdGkiOiJlODhkNGRkODI3NDg0OTk4OTU0YTI5ODBkMTc5MGUzNSIsInVzZXJfaWQiOiI1OWQ2NmU1Zi1hNmQ1LTRiZmEtOWU5ZS1hZGFkMmZlZDgxNzgiLCJvcmdhbml6YXRpb25faWQiOiI3NDRjOGFmNS1kYjNhLTQxNjEtYmEzMS0yM2ZkNmQzY2ZmNWYiLCJyb2xlIjoib3duZXIiLCJwcm9wZXJ0eV9pZHMiOlsiNGEyNDhkMGUtNTEwMC00NjY4LThhYWYtMjQ2YTk3NjMxMzdjIl0sImZ1bGxfbmFtZSI6IkF1c3RpbiBBZG1pbiJ9.CPw_I6y0KrfPjAbzmNUm6Ba4Su2ze1FnRF1_3Rc3TNM',NULL,'2026-02-16 11:10:53.000000',NULL,'e88d4dd827484998954a2980d1790e35'),(8,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc3MTI3MzU0MiwiaWF0IjoxNzcwNjY4NzQyLCJqdGkiOiJmNzNjMWMxYWI4YmY0Njc5OTFjYzVlOWI4MTUwNmEyNyIsInVzZXJfaWQiOiI1OWQ2NmU1Zi1hNmQ1LTRiZmEtOWU5ZS1hZGFkMmZlZDgxNzgifQ.iLHq6XiBm1aAwrbxg7938TmXGOpg4FJsDuC6HrVqWpw','2026-02-09 20:25:42.135655','2026-02-16 20:25:42.000000','59d66e5fa6d54bfa9e9eadad2fed8178','f73c1c1ab8bf467991cc5e9b81506a27'),(9,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc3MTMzOTQ0OCwiaWF0IjoxNzcwNzM0NjQ4LCJqdGkiOiI0NzRjYjZiMTVkYzE0NDdlOGRiNjYxMjI5ODQ0MTc4MyIsInVzZXJfaWQiOiI1OWQ2NmU1Zi1hNmQ1LTRiZmEtOWU5ZS1hZGFkMmZlZDgxNzgifQ.HZZD3KcKad5L-JdomAPB4W1SQm3pygHbO039LhJ3ems','2026-02-10 14:44:08.370787','2026-02-17 14:44:08.000000','59d66e5fa6d54bfa9e9eadad2fed8178','474cb6b15dc1447e8db6612298441783'),(10,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc3MTM0MzA2OCwiaWF0IjoxNzcwNzM4MjY4LCJqdGkiOiIyY2IxYjc1M2NjZTc0MjdkODFhNTAzNjNmYjdiNmQyNSIsInVzZXJfaWQiOiI1OWQ2NmU1Zi1hNmQ1LTRiZmEtOWU5ZS1hZGFkMmZlZDgxNzgiLCJvcmdhbml6YXRpb25faWQiOiI3NDRjOGFmNS1kYjNhLTQxNjEtYmEzMS0yM2ZkNmQzY2ZmNWYiLCJyb2xlIjoib3duZXIiLCJwcm9wZXJ0eV9pZHMiOlsiNGEyNDhkMGUtNTEwMC00NjY4LThhYWYtMjQ2YTk3NjMxMzdjIl0sImZ1bGxfbmFtZSI6IkF1c3RpbiBBZG1pbiJ9.xSwRWHxRCsZqr8qWFhfd24aqU5jK4XyAmAT5kuGcpNI',NULL,'2026-02-17 15:44:28.000000',NULL,'2cb1b753cce7427d81a50363fb7b6d25'),(11,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc3MTQxMDYyOSwiaWF0IjoxNzcwODA1ODI5LCJqdGkiOiJmN2ZmNWJlMjExMzQ0YjU3YjlhZWMzNDRhZjFiZTA1NSIsInVzZXJfaWQiOiI1OWQ2NmU1Zi1hNmQ1LTRiZmEtOWU5ZS1hZGFkMmZlZDgxNzgiLCJvcmdhbml6YXRpb25faWQiOiI3NDRjOGFmNS1kYjNhLTQxNjEtYmEzMS0yM2ZkNmQzY2ZmNWYiLCJyb2xlIjoib3duZXIiLCJwcm9wZXJ0eV9pZHMiOlsiNGEyNDhkMGUtNTEwMC00NjY4LThhYWYtMjQ2YTk3NjMxMzdjIl0sImZ1bGxfbmFtZSI6IkF1c3RpbiBBZG1pbiJ9.ZJlazkMJX23swvy7TR9qvmzHly7jXsV_B6uznSZdfl4',NULL,'2026-02-18 10:30:29.000000',NULL,'f7ff5be211344b57b9aec344af1be055'),(12,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc3MTQzMjQ0MCwiaWF0IjoxNzcwODI3NjQwLCJqdGkiOiJhOTUxZGRhODZlOGU0MThiOTRiNjNkMTMzZDQ4OWFjYyIsInVzZXJfaWQiOiI1OWQ2NmU1Zi1hNmQ1LTRiZmEtOWU5ZS1hZGFkMmZlZDgxNzgiLCJvcmdhbml6YXRpb25faWQiOiI3NDRjOGFmNS1kYjNhLTQxNjEtYmEzMS0yM2ZkNmQzY2ZmNWYiLCJyb2xlIjoib3duZXIiLCJwcm9wZXJ0eV9pZHMiOlsiNGEyNDhkMGUtNTEwMC00NjY4LThhYWYtMjQ2YTk3NjMxMzdjIl0sImZ1bGxfbmFtZSI6IkF1c3RpbiBBZG1pbiJ9.xpTAyVNRZPIyptUZw-qDd_i6n0iiUdMVIbu6C4Nw1_I',NULL,'2026-02-18 16:34:00.000000',NULL,'a951dda86e8e418b94b63d133d489acc'),(13,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc3MTQ3Nzc4MiwiaWF0IjoxNzcwODcyOTgyLCJqdGkiOiJhZTQ0YzE4Y2I3YjM0NzRmOTM5NjQyNjNiNTk3MmY0NyIsInVzZXJfaWQiOiI1OWQ2NmU1Zi1hNmQ1LTRiZmEtOWU5ZS1hZGFkMmZlZDgxNzgiLCJvcmdhbml6YXRpb25faWQiOiI3NDRjOGFmNS1kYjNhLTQxNjEtYmEzMS0yM2ZkNmQzY2ZmNWYiLCJyb2xlIjoib3duZXIiLCJwcm9wZXJ0eV9pZHMiOlsiNGEyNDhkMGUtNTEwMC00NjY4LThhYWYtMjQ2YTk3NjMxMzdjIl0sImZ1bGxfbmFtZSI6IkF1c3RpbiBBZG1pbiJ9.hwil_nM7Eb4rHqay2c_R8M2YVdy9Q0-MFaHLYzoTlgY',NULL,'2026-02-19 05:09:42.000000',NULL,'ae44c18cb7b3474f93964263b5972f47');
/*!40000 ALTER TABLE `token_blacklist_outstandingtoken` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `users_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_user` (
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `id` char(32) NOT NULL,
  `email` varchar(254) NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `role` varchar(20) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `organization_id` char(32) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `users_user_organization_id_70643736_fk_organizat` (`organization_id`),
  CONSTRAINT `users_user_organization_id_70643736_fk_organizat` FOREIGN KEY (`organization_id`) REFERENCES `organizations_organization` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `users_user` WRITE;
/*!40000 ALTER TABLE `users_user` DISABLE KEYS */;
INSERT INTO `users_user` VALUES ('pbkdf2_sha256$870000$YVMQXuwr47kJrKWKgvh52v$x4bsNV7zINbDUKI+yuFmnLKtRnVlumtSGH0NDikCkPo=',NULL,0,'1428706dea264c5ab3fc10f381bc5b60','manager@hoteldemo.pe','Carlos','Mendoza','manager',1,0,'2026-02-08 21:37:14.014371','2026-02-08 21:37:14.185842','744c8af5db3a4161ba3123fd6d3cff5f'),('pbkdf2_sha256$870000$YsJYZFliZHjhoKQufyHhrK$PT/VfZcuUsCNRpgfIwTQtvwzNaJ+0BXu7J43KjIzQik=',NULL,0,'59d66e5fa6d54bfa9e9eadad2fed8178','owner@hoteldemo.pe','Austin','Admin','owner',1,0,'2026-02-08 21:29:13.453631','2026-02-08 21:29:13.453645','744c8af5db3a4161ba3123fd6d3cff5f'),('pbkdf2_sha256$870000$842Tj8pvU3EHfiyR1j9Yab$unFQYeiWi6KaR84Vk2VgCOdW9nV1IfEZ+3JRvhTNkjw=',NULL,0,'824359e9309a4348b10dcdc20409a77c','recepcion@hoteldemo.pe','María','García','reception',1,0,'2026-02-08 21:37:13.660289','2026-02-08 21:37:13.832421','744c8af5db3a4161ba3123fd6d3cff5f'),('pbkdf2_sha256$870000$oJTJiq3fRm2jG6QJ97TAeu$ZXf4ke+IDlGzA9ARx3WMU/TjyZEk3ulnNJYQkSNp9cw=',NULL,0,'d7ad971301c84372b701b000a77d9c15','mantenimiento@hoteldemo.pe','Jorge','Quispe','maintenance',1,0,'2026-02-08 21:37:14.189117','2026-02-08 21:37:14.370719','744c8af5db3a4161ba3123fd6d3cff5f'),('pbkdf2_sha256$870000$3NwnIWOcEFRSkEedBl7aPB$DpJYx5YwxMnYGO7IncOnsWtv6ZVmjSGRx0m5f3GjnY8=',NULL,0,'fe97b4015f94491da73e6d8ca68edb43','housekeeping@hoteldemo.pe','Carmen','López','housekeeping',1,0,'2026-02-08 21:37:13.842100','2026-02-08 21:37:14.011240','744c8af5db3a4161ba3123fd6d3cff5f');
/*!40000 ALTER TABLE `users_user` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `users_user_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_user_groups` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` char(32) NOT NULL,
  `group_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_user_groups_user_id_group_id_b88eab82_uniq` (`user_id`,`group_id`),
  KEY `users_user_groups_group_id_9afc8d0e_fk_auth_group_id` (`group_id`),
  CONSTRAINT `users_user_groups_group_id_9afc8d0e_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  CONSTRAINT `users_user_groups_user_id_5f6f5a90_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `users_user_groups` WRITE;
/*!40000 ALTER TABLE `users_user_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `users_user_groups` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `users_user_properties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_user_properties` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` char(32) NOT NULL,
  `property_id` char(32) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_user_properties_user_id_property_id_db20510f_uniq` (`user_id`,`property_id`),
  KEY `users_user_propertie_property_id_f2641c03_fk_organizat` (`property_id`),
  CONSTRAINT `users_user_propertie_property_id_f2641c03_fk_organizat` FOREIGN KEY (`property_id`) REFERENCES `organizations_property` (`id`),
  CONSTRAINT `users_user_properties_user_id_5dfbc479_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `users_user_properties` WRITE;
/*!40000 ALTER TABLE `users_user_properties` DISABLE KEYS */;
INSERT INTO `users_user_properties` VALUES (4,'1428706dea264c5ab3fc10f381bc5b60','4a248d0e510046688aaf246a9763137c'),(1,'59d66e5fa6d54bfa9e9eadad2fed8178','4a248d0e510046688aaf246a9763137c'),(2,'824359e9309a4348b10dcdc20409a77c','4a248d0e510046688aaf246a9763137c'),(5,'d7ad971301c84372b701b000a77d9c15','4a248d0e510046688aaf246a9763137c'),(3,'fe97b4015f94491da73e6d8ca68edb43','4a248d0e510046688aaf246a9763137c');
/*!40000 ALTER TABLE `users_user_properties` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `users_user_user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_user_user_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` char(32) NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_user_user_permissions_user_id_permission_id_43338c45_uniq` (`user_id`,`permission_id`),
  KEY `users_user_user_perm_permission_id_0b93982e_fk_auth_perm` (`permission_id`),
  CONSTRAINT `users_user_user_perm_permission_id_0b93982e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `users_user_user_permissions_user_id_20aca447_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `users_user_user_permissions` WRITE;
/*!40000 ALTER TABLE `users_user_user_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `users_user_user_permissions` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

