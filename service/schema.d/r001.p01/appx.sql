DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`_appx_meta`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`_realm`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`_realm_user`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`_realm_token`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`_realm_module`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`_realm_app`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`_auth_grant`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`_auth_func_perm`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`_auth_obj_perm`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`_spec_audit`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`_status_audit`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`_status_history`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`namespace`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`namespace_status`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`runtime`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`runtime_status`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`app`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`app_status`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`deployment`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`deployment_status`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`obj`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`obj_status`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`attr`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`attr_status`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`relation`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`relation_status`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`api`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`api_status`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`transform`;
DROP TABLE IF EXISTS `{{{global.schema_prefix}}}`.`transform_status`;

-- metadata --
CREATE TABLE `{{{global.schema_prefix}}}`.`_appx_meta` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `meta_name`             VARCHAR(32)             NOT NULL,
    `meta_key`              VARCHAR(32)             NOT NULL,
    `meta_info`             JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX `unique_idx`(`meta_name`, `meta_key`),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

-- realm --
CREATE TABLE `{{{global.schema_prefix}}}`.`_realm` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `realm`                 VARCHAR(32)             NOT NULL,
    `realm_key`             VARBINARY(64)           NOT NULL,
    `realm_spec`            JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX `unique_idx`(`realm`),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

-- user(s) --
CREATE TABLE `{{{global.schema_prefix}}}`.`_realm_user` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `realm`                 VARCHAR(32)             NOT NULL,
    `username`              VARCHAR(32)             NOT NULL,
    `password`              VARCHAR(255)            NOT NULL,
    `user_spec`             JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX `unique_idx`(`realm`, `username`),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

-- token(s) --
CREATE TABLE `{{{global.schema_prefix}}}`.`_realm_token` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `realm`                 VARCHAR(32)             NOT NULL,
    `token`                 VARCHAR(255)            NOT NULL,
    `username`              VARCHAR(32)             NOT NULL,
    `expiration`            DATETIME                NOT NULL,
    `token_spec`            JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX `unique_idx`(`realm`, `token`),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

-- auth module --
CREATE TABLE `{{{global.schema_prefix}}}`.`_realm_module` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `realm`                 VARCHAR(32)             NOT NULL,
    `module_name`           VARCHAR(32)             NOT NULL,
    `module_pattern`        VARCHAR(255)            NOT NULL,
    `module_spec`           JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX `unique_idx`(`realm`, `module_name`),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

-- realm to app mapping --
CREATE TABLE `{{{global.schema_prefix}}}`.`_realm_app` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `realm`                 VARCHAR(32)             NOT NULL,
    `namespace`             VARCHAR(32)             NOT NULL,
    `app_name`              VARCHAR(32)             NOT NULL,
    `realm_app_spec`        JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX `unique_idx`(`realm`, `namespace`, `app_name`),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

-- auth grant --
CREATE TABLE `{{{global.schema_prefix}}}`.`_auth_grant` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `app_name`              VARCHAR(32)             NOT NULL,
    `role_name`             VARCHAR(32)             NOT NULL,
    `grant_type`            VARCHAR(32)             NOT NULL,       -- can be [group] or [user]
    `grant_name`            VARCHAR(32)             NOT NULL,       -- can be [group name] or [user name]
    `grant_spec`            JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX `unique_idx`(`namespace`, `app_name`, `role_name`, `grant_type`, `grant_name`),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

-- function permissions --
CREATE TABLE `{{{global.schema_prefix}}}`.`_auth_func_perm` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `app_name`              VARCHAR(32)             NOT NULL,
    `role_name`             VARCHAR(32)             NOT NULL,
    `auth_func_name`        VARCHAR(32)             NOT NULL,
    `auth_func_spec`        JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX `unique_idx`(`namespace`, `app_name`, `role_name`, `auth_func_name`),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

-- object permissions --
CREATE TABLE `{{{global.schema_prefix}}}`.`_auth_obj_perm` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `app_name`              VARCHAR(32)             NOT NULL,
    `role_name`             VARCHAR(32)             NOT NULL,
    `auth_obj_type`         VARCHAR(32)             NOT NULL,
    `auth_obj_key`          VARCHAR(64)             NOT NULL,
    `auth_func_name`        VARCHAR(32)             NOT NULL,
    `auth_obj_spec`         JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX `unique_idx`(`namespace`, `role_name`, `auth_obj_type`, `auth_obj_key`, `auth_func_name`),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

-- spec auditing --
CREATE TABLE `{{{global.schema_prefix}}}`.`_spec_audit` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `app_name`              VARCHAR(15)             NOT NULL,
    `obj_name`              VARCHAR(32)             NOT NULL,
    `obj_id`                BIGINT                  NOT NULL,
    `audit_prev`            JSON                    NOT NULL,
    `audit_curr`            JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`, `namespace`, `app_name`, `obj_name`)
)
CHARACTER SET utf8 COLLATE utf8_bin
PARTITION BY KEY(`namespace`, `app_name`, `obj_name`) PARTITIONS 20;

-- state auditing --
CREATE TABLE `{{{global.schema_prefix}}}`.`_status_audit` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `app_name`              VARCHAR(15)             NOT NULL,
    `obj_name`              VARCHAR(32)             NOT NULL,
    `obj_id`                BIGINT                  NOT NULL,
    `audit_status`          JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`, `namespace`, `app_name`, `obj_name`)
)
CHARACTER SET utf8 COLLATE utf8_bin
PARTITION BY KEY(`namespace`, `app_name`, `obj_name`) PARTITIONS 20;

-- state history --
CREATE TABLE `{{{global.schema_prefix}}}`.`_status_history` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `app_name`              VARCHAR(15)             NOT NULL,
    `obj_name`              VARCHAR(32)             NOT NULL,
    `obj_id`                BIGINT                  NOT NULL,
    `obj_time`              DATETIME                NOT NULL,
    `history_status`        JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE INDEX `unique_idx`(`namespace`, `app_name`, `obj_name`, `obj_id`, `obj_time`),
    PRIMARY KEY (`id`, `namespace`, `app_name`, `obj_name`)
)
CHARACTER SET utf8 COLLATE utf8_bin
PARTITION BY KEY(`namespace`, `app_name`, `obj_name`) PARTITIONS 20;

-- main schema --
CREATE TABLE `{{{global.schema_prefix}}}`.`namespace` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `owner_realm`           VARCHAR(32)             NOT NULL,
    `owner_name`            VARCHAR(32)             NOT NULL,
    `namespace_spec`        JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX `unique_idx`(`namespace`),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

CREATE TABLE `{{{global.schema_prefix}}}`.`namespace_status` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `namespace_status`      JSON                    NOT NULL,
    `status_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX `unique_idx`(`namespace`),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

CREATE TABLE `{{{global.schema_prefix}}}`.`runtime` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `runtime_name`          VARCHAR(9)              NOT NULL,
    `runtime_spec`          JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX `unique_idx`(`namespace`, `runtime_name`),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

CREATE TABLE `{{{global.schema_prefix}}}`.`runtime_status` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `runtime_name`          VARCHAR(9)              NOT NULL,
    `runtime_status`        JSON                    NOT NULL,
    `status_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX `unique_idx`(`namespace`, `runtime_name`),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

CREATE TABLE `{{{global.schema_prefix}}}`.`app` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `app_name`              VARCHAR(15)             NOT NULL,
    `app_ver`               VARCHAR(32)             NOT NULL,
    `app_spec`              JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX `unique_idx`(`namespace`, `app_name`, `app_ver`),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

CREATE TABLE `{{{global.schema_prefix}}}`.`app_status` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `app_name`              VARCHAR(15)             NOT NULL,
    `app_ver`               VARCHAR(32)             NOT NULL,
    `app_status`            JSON                    NOT NULL,
    `status_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX `unique_idx`(`namespace`, `app_name`, `app_ver`),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

CREATE TABLE `{{{global.schema_prefix}}}`.`deployment` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `runtime_name`          VARCHAR(9)              NOT NULL,
    `app_name`              VARCHAR(15)             NOT NULL,
    `app_ver`               VARCHAR(32)             NOT NULL,
    `deployment_spec`       JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX `unique_idx`(`namespace`, `runtime_name`, `app_name`),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

CREATE TABLE `{{{global.schema_prefix}}}`.`deployment_status` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `runtime_name`          VARCHAR(9)              NOT NULL,
    `app_name`              VARCHAR(15)             NOT NULL,
    `app_ver`               VARCHAR(32)             NOT NULL,
    `deployment_status`     JSON                    NOT NULL,
    `status_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX `unique_idx`(`namespace`, `runtime_name`, `app_name`),
    PRIMARY KEY (`id`)
)
CHARACTER SET utf8 COLLATE utf8_bin;

CREATE TABLE `{{{global.schema_prefix}}}`.`obj` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `app_name`              VARCHAR(15)             NOT NULL,
    `app_ver`               VARCHAR(32)             NOT NULL,
    `obj_name`              VARCHAR(32)             NOT NULL,
    `obj_type`              VARCHAR(32)             NOT NULL,           -- 'spec' or 'status'
    `obj_spec`              JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX `unique_idx`(`namespace`, `app_name`, `app_ver`, `obj_name`),
    PRIMARY KEY (`id`, `namespace`, `app_name`)
)
CHARACTER SET utf8 COLLATE utf8_bin
PARTITION BY KEY(`namespace`, `app_name`) PARTITIONS 20;

CREATE TABLE `{{{global.schema_prefix}}}`.`obj_status` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `runtime_name`          VARCHAR(9)              NOT NULL,
    `app_name`              VARCHAR(15)             NOT NULL,
    `obj_name`              VARCHAR(32)             NOT NULL,
    `obj_status`            JSON                    NOT NULL,
    `status_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX `unique_idx`(`namespace`, `runtime_name`, `app_name`, `obj_name`),
    PRIMARY KEY (`id`, `namespace`, `runtime_name`, `app_name`)
)
CHARACTER SET utf8 COLLATE utf8_bin
PARTITION BY KEY(`namespace`, `runtime_name`, `app_name`) PARTITIONS 20;

CREATE TABLE `{{{global.schema_prefix}}}`.`relation` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `app_name`              VARCHAR(15)             NOT NULL,
    `app_ver`               VARCHAR(32)             NOT NULL,
    `obj_name`              VARCHAR(32)             NOT NULL,
    `objn_name`             VARCHAR(32)             NOT NULL,
    `relation_spec`         JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX `unique_idx`(`namespace`, `app_name`, `app_ver`, `obj_name`, `objn_name`),
    PRIMARY KEY (`id`, `namespace`, `app_name`)
)
CHARACTER SET utf8 COLLATE utf8_bin
PARTITION BY KEY(`namespace`, `app_name`) PARTITIONS 20;

CREATE TABLE `{{{global.schema_prefix}}}`.`relation_status` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `runtime_name`          VARCHAR(9)              NOT NULL,
    `app_name`              VARCHAR(15)             NOT NULL,
    `obj_name`              VARCHAR(32)             NOT NULL,
    `objn_name`             VARCHAR(32)             NOT NULL,
    `relation_status`       JSON                    NOT NULL,
    `status_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX `unique_idx`(`namespace`, `runtime_name`, `app_name`, `obj_name`, `objn_name`),
    PRIMARY KEY (`id`, `namespace`, `runtime_name`, `app_name`)
)
CHARACTER SET utf8 COLLATE utf8_bin
PARTITION BY KEY(`namespace`, `runtime_name`, `app_name`) PARTITIONS 20;

CREATE TABLE `{{{global.schema_prefix}}}`.`attr` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `app_name`              VARCHAR(15)             NOT NULL,
    `app_ver`               VARCHAR(32)             NOT NULL,
    `obj_name`              VARCHAR(32)             NOT NULL,
    `attr_name`             VARCHAR(32)             NOT NULL,
    `attr_spec`             JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX `unique_idx`(`namespace`, `app_name`, `app_ver`, `obj_name`, `attr_name`),
    PRIMARY KEY (`id`, `namespace`, `app_name`)
)
CHARACTER SET utf8 COLLATE utf8_bin
PARTITION BY KEY(`namespace`, `app_name`) PARTITIONS 20;

CREATE TABLE `{{{global.schema_prefix}}}`.`attr_status` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `runtime_name`          VARCHAR(9)              NOT NULL,
    `app_name`              VARCHAR(15)             NOT NULL,
    `obj_name`              VARCHAR(32)             NOT NULL,
    `attr_name`             VARCHAR(32)             NOT NULL,
    `attr_status`           JSON                    NOT NULL,
    `status_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX `unique_idx`(`namespace`, `runtime_name`, `app_name`, `obj_name`, `attr_name`),
    PRIMARY KEY (`id`, `namespace`, `runtime_name`, `app_name`)
)
CHARACTER SET utf8 COLLATE utf8_bin
PARTITION BY KEY(`namespace`, `runtime_name`, `app_name`) PARTITIONS 20;

CREATE TABLE `{{{global.schema_prefix}}}`.`api` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `app_name`              VARCHAR(15)             NOT NULL,
    `app_ver`               VARCHAR(32)             NOT NULL,
    `obj_name`              VARCHAR(32)             NOT NULL,
    `api_method`            VARCHAR(15)             NOT NULL,
    `api_endpoint`          VARCHAR(255)            NOT NULL,
    `api_spec`              JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX `unique_idx`(`namespace`, `app_name`, `app_ver`, `obj_name`, `api_method`, `api_endpoint`),
    PRIMARY KEY (`id`, `namespace`, `app_name`)
)
CHARACTER SET utf8 COLLATE utf8_bin
PARTITION BY KEY(`namespace`, `app_name`) PARTITIONS 20;

CREATE TABLE `{{{global.schema_prefix}}}`.`api_status` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `runtime_name`          VARCHAR(9)              NOT NULL,
    `app_name`              VARCHAR(15)             NOT NULL,
    `obj_name`              VARCHAR(32)             NOT NULL,
    `api_method`            VARCHAR(15)             NOT NULL,
    `api_endpoint`          VARCHAR(255)            NOT NULL,
    `api_status`            JSON                    NOT NULL,
    `status_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX `unique_idx`(`namespace`, `runtime_name`, `app_name`, `obj_name`, `api_method`, `api_endpoint`),
    PRIMARY KEY (`id`, `namespace`, `runtime_name`, `app_name`)
)
CHARACTER SET utf8 COLLATE utf8_bin
PARTITION BY KEY(`namespace`, `runtime_name`, `app_name`) PARTITIONS 20;

CREATE TABLE `{{{global.schema_prefix}}}`.`transform` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `app_name`              VARCHAR(15)             NOT NULL,
    `app_ver`               VARCHAR(32)             NOT NULL,
    `obj_name`              VARCHAR(32)             NOT NULL,
    `src_namespace`         VARCHAR(32)             NOT NULL,
    `src_app_name`          VARCHAR(15)             NOT NULL,
    `src_app_ver`           VARCHAR(32)             NOT NULL,
    `src_obj_name`          VARCHAR(32)             NOT NULL,
    `transform_name`        VARCHAR(32)             NOT NULL,
    `transform_spec`        JSON                    NOT NULL,
    `create_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX `unique_idx`(`namespace`, `app_name`, `app_ver`, `obj_name`, `src_namespace`, `src_app_name`, `src_app_ver`, src_obj_name, transform_name),
    PRIMARY KEY (`id`, `namespace`, `app_name`)
)
CHARACTER SET utf8 COLLATE utf8_bin
PARTITION BY KEY(`namespace`, `app_name`) PARTITIONS 20;

CREATE TABLE `{{{global.schema_prefix}}}`.`transform_status` (
    `id`                    BIGINT                  NOT NULL AUTO_INCREMENT,
    `namespace`             VARCHAR(32)             NOT NULL,
    `runtime_name`          VARCHAR(9)              NOT NULL,
    `app_name`              VARCHAR(15)             NOT NULL,
    `obj_name`              VARCHAR(32)             NOT NULL,
    `transform_name`        VARCHAR(32)             NOT NULL,
    `transform_status`      JSON                    NOT NULL,
    `status_time`           TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`               TINYINT(1)              NOT NULL DEFAULT 0,
    UNIQUE INDEX `unique_idx`(`namespace`, `runtime_name`, `app_name`, `obj_name`, `transform_name`),
    PRIMARY KEY (`id`, `namespace`, `runtime_name`, `app_name`)
)
CHARACTER SET utf8 COLLATE utf8_bin
PARTITION BY KEY(`namespace`, `runtime_name`, `app_name`) PARTITIONS 20;

-- metadata --
{{#_appx_meta}}
{{#.}}
INSERT INTO `{{{global.schema_prefix}}}`.`_appx_meta`(`meta_name`, `meta_key`, `meta_info`) VALUES ('{{{meta_name}}}', '{{{meta_key}}}', {{#meta_info}}{{#APPX.TO_MYSQL_JSON}}{{/APPX.TO_MYSQL_JSON}}{{/meta_info}}) ON DUPLICATE KEY UPDATE meta_info=VALUES(meta_info);
{{/.}}
{{/_appx_meta}}


-- realm --
{{#_realm}}
{{#.}}
INSERT INTO `{{{global.schema_prefix}}}`.`_realm`(`realm`, `realm_key`, `realm_spec`) VALUES ('{{{realm}}}', {{{realm_key}}}, {{#realm_spec}}{{#APPX.TO_MYSQL_JSON}}{{/APPX.TO_MYSQL_JSON}}{{/realm_spec}}) ON DUPLICATE KEY UPDATE realm_key=VALUES(realm_key), realm_spec=VALUES(realm_spec);
{{/.}}
{{/_realm}}

-- local users --
{{#_realm_user}}
{{#.}}
INSERT INTO `{{{global.schema_prefix}}}`.`_realm_user`(`realm`, `username`, `password`, `user_spec`) VALUES ('{{{realm}}}', '{{{username}}}', {{{password}}}, {{#user_spec}}{{#APPX.TO_MYSQL_JSON}}{{/APPX.TO_MYSQL_JSON}}{{/user_spec}}) ON DUPLICATE KEY UPDATE password=VALUES(password), user_spec=VALUES(user_spec);
{{/.}}
{{/_realm_user}}

-- auth modules --
{{#_realm_module}}
{{#.}}
INSERT INTO `{{{global.schema_prefix}}}`.`_realm_module`(`realm`, `module_name`, `module_pattern`, `module_spec`) VALUES ('{{{realm}}}', '{{{module_name}}}', '{{{module_pattern}}}', {{#module_spec}}{{#APPX.TO_MYSQL_JSON}}{{/APPX.TO_MYSQL_JSON}}{{/module_spec}}) ON DUPLICATE KEY UPDATE module_pattern=VALUES(module_pattern), module_spec=VALUES(module_spec);
{{/.}}
{{/_realm_module}}

-- auth app realms --
{{#_realm_app}}
{{#.}}
INSERT INTO `{{{global.schema_prefix}}}`.`_realm_app`(`realm`, `namespace`, `app_name`, `realm_app_spec`) VALUES ('{{{realm}}}', '{{{namespace}}}', '{{{app_name}}}', {{#realm_app_spec}}{{#APPX.TO_MYSQL_JSON}}{{/APPX.TO_MYSQL_JSON}}{{/realm_app_spec}}) ON DUPLICATE KEY UPDATE realm_app_spec=VALUES(realm_app_spec);
{{/.}}
{{/_realm_app}}

-- role definitions --
{{#_auth_grant}}
{{#.}}
INSERT INTO `{{{global.schema_prefix}}}`.`_auth_grant`(`namespace`, `app_name`, `role_name`, `grant_type`, `grant_name`, `grant_spec`) VALUES ('{{{namespace}}}', '{{{app_name}}}', '{{{role_name}}}', '{{{grant_type}}}', '{{{grant_name}}}', {{#grant_spec}}{{#APPX.TO_MYSQL_JSON}}{{/APPX.TO_MYSQL_JSON}}{{/grant_spec}}) ON DUPLICATE KEY UPDATE grant_spec=VALUES(grant_spec);
{{/.}}
{{/_auth_grant}}

-- permission definitions --
{{#_auth_func_perm}}
{{#.}}
INSERT INTO `{{{global.schema_prefix}}}`.`_auth_func_perm`(`namespace`, `app_name`, `role_name`, `auth_func_name`, `auth_func_spec`) VALUES ('{{{namespace}}}', '{{{app_name}}}', '{{{role_name}}}', '{{{auth_func_name}}}', {{#auth_func_spec}}{{#APPX.TO_MYSQL_JSON}}{{/APPX.TO_MYSQL_JSON}}{{/auth_func_spec}}) ON DUPLICATE KEY UPDATE auth_func_spec=VALUES(auth_func_spec);
{{/.}}
{{/_auth_func_perm}}

-- namespace --
{{#namespace}}
{{#.}}
INSERT INTO `{{{global.schema_prefix}}}`.`namespace`(`namespace`, `owner_realm`, `owner_name`, `namespace_spec`) VALUES ('{{{namespace}}}', '{{{owner_realm}}}', '{{{owner_name}}}', {{#namespace_spec}}{{#APPX.TO_MYSQL_JSON}}{{/APPX.TO_MYSQL_JSON}}{{/namespace_spec}}) ON DUPLICATE KEY UPDATE owner_realm=VALUES(owner_realm), owner_name=VALUES(owner_name), namespace_spec=VALUES(namespace_spec);
{{/.}}
{{/namespace}}

-- app --
{{#app}}
{{#.}}
INSERT INTO `{{{global.schema_prefix}}}`.`app`(`namespace`, `app_name`, `app_ver`, `app_spec`) VALUES ('{{{namespace}}}', '{{{app_name}}}', '{{{app_ver}}}', {{#app_spec}}{{#APPX.TO_MYSQL_JSON}}{{/APPX.TO_MYSQL_JSON}}{{/app_spec}}) ON DUPLICATE KEY UPDATE app_spec=VALUES(app_spec);
{{/.}}
{{/app}}

-- runtime --
{{#runtime}}
{{#.}}
INSERT INTO `{{{global.schema_prefix}}}`.`runtime`(`namespace`, `runtime_name`, `runtime_spec`) VALUES ('{{{namespace}}}', '{{{runtime_name}}}', {{#runtime_spec}}{{#APPX.TO_MYSQL_JSON}}{{/APPX.TO_MYSQL_JSON}}{{/runtime_spec}}) ON DUPLICATE KEY UPDATE runtime_spec=VALUES(runtime_spec);
{{/.}}
{{/runtime}}

-- deployment --
{{#deployment}}
{{#.}}
INSERT INTO `{{{global.schema_prefix}}}`.`deployment`(`namespace`, `runtime_name`, `app_name`, `app_ver`, `deployment_spec`) VALUES ('{{{namespace}}}', '{{{runtime_name}}}', '{{{app_name}}}', '{{{app_ver}}}', {{#deployment_spec}}{{#APPX.TO_MYSQL_JSON}}{{/APPX.TO_MYSQL_JSON}}{{/deployment_spec}})  ON DUPLICATE KEY UPDATE app_ver=VALUES(app_ver), deployment_spec=VALUES(deployment_spec);
{{/.}}
{{/deployment}}

-- obj --
{{#obj}}
{{#.}}
INSERT INTO `{{{global.schema_prefix}}}`.`obj`(`namespace`, `app_name`, `app_ver`, `obj_name`, `obj_type`, `obj_spec`) VALUES ('{{{namespace}}}', '{{{app_name}}}', '{{{app_ver}}}', '{{{obj_name}}}', '{{{obj_type}}}', {{#obj_spec}}{{#APPX.TO_MYSQL_JSON}}{{/APPX.TO_MYSQL_JSON}}{{/obj_spec}}) ON DUPLICATE KEY UPDATE obj_type=VALUES(obj_type), obj_spec=VALUES(obj_spec);
{{/.}}
{{/obj}}

-- relation --
{{#relation}}
{{#.}}
INSERT INTO `{{{global.schema_prefix}}}`.`relation`(`namespace`, `app_name`, `app_ver`, `obj_name`, `objn_name`, `relation_spec`) VALUES ('{{{namespace}}}', '{{{app_name}}}', '{{{app_ver}}}', '{{{obj_name}}}', '{{{objn_name}}}', {{#relation_spec}}{{#APPX.TO_MYSQL_JSON}}{{/APPX.TO_MYSQL_JSON}}{{/relation_spec}}) ON DUPLICATE KEY UPDATE relation_spec=VALUES(relation_spec);
{{/.}}
{{/relation}}

-- attr --
{{#attr}}
{{#.}}
INSERT INTO `{{{global.schema_prefix}}}`.`attr`(`namespace`, `app_name`, `app_ver`, `obj_name`, `attr_name`, `attr_spec`) VALUES ('{{{namespace}}}', '{{{app_name}}}', '{{{app_ver}}}', '{{{obj_name}}}', '{{{attr_name}}}', {{#attr_spec}}{{#APPX.TO_MYSQL_JSON}}{{/APPX.TO_MYSQL_JSON}}{{/attr_spec}}) ON DUPLICATE KEY UPDATE attr_spec=VALUES(attr_spec);
{{/.}}
{{/attr}}

-- api --
{{#api}}
{{#.}}
INSERT INTO `{{{global.schema_prefix}}}`.`api`(`namespace`, `app_name`, `app_ver`, `obj_name`, `api_method`, `api_endpoint`, `api_spec`) VALUES ('{{{namespace}}}', '{{{app_name}}}', '{{{app_ver}}}', '{{{obj_name}}}', '{{{api_method}}}', '{{{api_endpoint}}}', {{#api_spec}}{{#APPX.TO_MYSQL_JSON}}{{/APPX.TO_MYSQL_JSON}}{{/api_spec}}) ON DUPLICATE KEY UPDATE api_spec=VALUES(api_spec);
{{/.}}
{{/api}}
