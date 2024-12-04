-- 删除测试数据
DELETE FROM tbl_sms_message;

-- 删除表
DROP TABLE IF EXISTS tbl_sms_message;
DROP TABLE IF EXISTS tbl_undeliver_rec_daily;
DROP TABLE IF EXISTS tbl_margin_tradelimit_daily;
DROP TABLE IF EXISTS tbl_unreached_acct;
DROP TABLE IF EXISTS tbl_unreached_reason;
DROP TABLE IF EXISTS operation_logs;


-- 创建表
-- 原因表
CREATE TABLE tbl_unreached_reason (
    id BIGINT PRIMARY KEY,
    description TEXT NOT NULL,
    created_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    last_modified_by VARCHAR(100),
    last_modified_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 账户表
CREATE TABLE tbl_unreached_acct (
    id BIGINT PRIMARY KEY,
    accountNo VARCHAR(100) NOT NULL,
    reason_id BIGINT NOT NULL,
    created_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    last_modified_by VARCHAR(100),
    last_modified_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reason_id) REFERENCES tbl_unreached_reason(id)
);

-- 操作日志表
CREATE TABLE operation_logs (
    id BIGINT PRIMARY KEY,
    operation_type VARCHAR(50) NOT NULL,
    module VARCHAR(50) NOT NULL,
    operation_desc TEXT NOT NULL,
    operation_data JSONB,
    operator VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 未投递手机号表（更新表结构）
CREATE TABLE tbl_undeliver_rec_daily (
    id BIGINT PRIMARY KEY,
    mobile_number VARCHAR(20) NOT NULL,
    delivery_time TIMESTAMP NOT NULL,
    termination_time TIMESTAMP NOT NULL,
    created_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    last_modified_by VARCHAR(100),
    last_modified_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 未投递账户表（更新表结构）
CREATE TABLE tbl_margin_tradelimit_daily (
    id BIGINT PRIMARY KEY,
    sec_Acc_No VARCHAR(100) NOT NULL,
    sec_Acc_No_9Digit VARCHAR(9) NOT NULL,
    sec_Acc_Name VARCHAR(200),
    margin_Flag CHAR(1),
    created_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    last_modified_by VARCHAR(100),
    last_modified_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- SMS消息表（用于测试）
CREATE TABLE tbl_sms_message (
    id BIGINT PRIMARY KEY,
    ac_no VARCHAR(100) NOT NULL,
    mobile_number VARCHAR(20) NOT NULL,
    content TEXT,
    status VARCHAR(20) NOT NULL,
    reason VARCHAR(200),
    send_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sender VARCHAR(20),
    submit_time TIMESTAMP
);

-- 创建用户快照表
CREATE TABLE tbl_user_snap (
    id BIGINT PRIMARY KEY,
    sec_acc_no VARCHAR(100) NOT NULL,
    sec_acc_no_9digit VARCHAR(9) NOT NULL,
    user_no VARCHAR(50) NOT NULL,
    tel_no VARCHAR(20) NOT NULL,
    created_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    last_modified_by VARCHAR(100),
    last_modified_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_user_snap_acc_no ON tbl_user_snap(sec_acc_no);
CREATE INDEX idx_user_snap_acc_no_9digit ON tbl_user_snap(sec_acc_no_9digit);
CREATE INDEX idx_user_snap_tel ON tbl_user_snap(tel_no);

-- 插入测试数据
INSERT INTO tbl_user_snap (
    id, sec_acc_no, sec_acc_no_9digit, user_no, tel_no, 
    created_by, last_modified_by
) VALUES
(1, 'A123456789012345', '123456789', 'USER001', '12345678901', 'SYSTEM', 'SYSTEM'),
(2, 'A123456789012346', '123456789', 'USER002', '12345678902', 'SYSTEM', 'SYSTEM'),
(3, 'B987654321098765', '987654321', 'USER003', '12345678903', 'SYSTEM', 'SYSTEM'),
(4, 'B987654321098766', '987654321', 'USER004', '12345678904', 'SYSTEM', 'SYSTEM'),
(5, 'C555555555555555', '555555555', 'USER005', '12345678905', 'SYSTEM', 'SYSTEM'),
(6, 'C555555555555556', '555555555', 'USER006', '12345678906', 'SYSTEM', 'SYSTEM'),
(7, 'D777777777777777', '777777777', 'USER007', '12345678907', 'SYSTEM', 'SYSTEM'),
(8, 'D777777777777778', '777777777', 'USER008', '12345678908', 'SYSTEM', 'SYSTEM'),
(9, 'E999999999999999', '999999999', 'USER009', '12345678909', 'SYSTEM', 'SYSTEM'),
(10, 'E999999999999990', '999999999', 'USER010', '12345678910', 'SYSTEM', 'SYSTEM');

-- 添加一些特定的测试数据，用于验证报表查询
-- 1. 添加一些在 tbl_margin_tradelimit_daily 中有但在 tbl_user_snap 中没有的账户
-- 2. 添加一些在两个表中都有，且电话号码在 tbl_undeliver_rec_daily 中的记录
INSERT INTO tbl_user_snap (
    id, sec_acc_no, sec_acc_no_9digit, user_no, tel_no, 
    created_by, last_modified_by
) VALUES
-- 这些用户的电话号码与 tbl_sms_message 中的失败记录匹配
(11, 'TEST00000000001', '000000001', 'USER011', '12345678901', 'SYSTEM', 'SYSTEM'),
(12, 'TEST00000000002', '000000002', 'USER012', '12345678902', 'SYSTEM', 'SYSTEM'),
(13, 'TEST00000000003', '000000003', 'USER013', '12345678903', 'SYSTEM', 'SYSTEM'),
(14, 'TEST00000000004', '000000004', 'USER014', '12345678904', 'SYSTEM', 'SYSTEM'),
(15, 'TEST00000000005', '000000005', 'USER015', '12345678905', 'SYSTEM', 'SYSTEM');

-- 插入SMS消息测试数据
INSERT INTO tbl_sms_message (id, ac_no, mobile_number, content, status, reason, send_time, sender, submit_time) VALUES
(1, 'ACC001', '12345678901', 'Test message 1', 'Fail', '101,UNDELIV', '2024-11-20 10:00:00', '10690000', '2024-11-20 09:55:00'),
(2, 'ACC002', '12345678902', 'Test message 2', 'Fail', '001,UNDELIV', '2024-11-20 10:15:00', '10690000', '2024-11-20 10:10:00'),
(3, 'ACC003', '12345678903', 'Test message 3', 'Fail', 'EXPIRED', '2024-11-20 10:30:00', '10690000', '2024-11-20 10:25:00'),
(4, 'ACC004', '12345678904', 'Test message 4', 'success', NULL, '2024-11-20 10:45:00', '10690000', '2024-11-20 10:40:00'),
(5, 'ACC001', '12345678901', 'Test message 5', 'Fail', '101,UNDELIV', '2024-11-21 09:00:00', '10690000', '2024-11-21 08:55:00'),
(6, 'ACC005', '12345678905', 'Test message 6', 'Fail', '001,UNDELIV', '2024-11-21 09:15:00', '10690000', '2024-11-21 09:10:00'),
(7, 'ACC006', '12345678906', 'Test message 7', 'success', NULL, '2024-11-21 09:30:00', '10690000', '2024-11-21 09:25:00'),
(8, 'ACC002', '12345678902', 'Test message 8', 'Fail', 'EXPIRED', '2024-11-21 09:45:00', '10690000', '2024-11-21 09:40:00'),
(9, 'ACC007', '12345678907', 'Test message 9', 'Fail', '101,UNDELIV', '2024-11-21 10:00:00', '10690000', '2024-11-21 09:55:00'),
(10, 'ACC008', '12345678908', 'Test message 10', 'Fail', '001,UNDELIV', '2024-11-21 10:15:00', '10690000', '2024-11-21 10:10:00'),
(11, 'ACC009', '12345678909', 'Test message 11', 'success', NULL, '2024-11-21 10:30:00', '10690000', '2024-11-21 10:25:00'),
(12, 'ACC010', '12345678910', 'Test message 12', 'Fail', 'EXPIRED', '2024-11-21 10:45:00', '10690000', '2024-11-21 10:40:00'),
(13, 'ACC003', '12345678903', 'Test message 13', 'Fail', '101,UNDELIV', '2024-11-22 09:00:00', '10690000', '2024-11-22 08:55:00'),
(14, 'ACC011', '12345678911', 'Test message 14', 'Fail', '001,UNDELIV', '2024-11-22 09:15:00', '10690000', '2024-11-22 09:10:00'),
(15, 'ACC012', '12345678912', 'Test message 15', 'Fail', 'EXPIRED', '2024-11-22 09:30:00', '10690000', '2024-11-22 09:25:00'); 
