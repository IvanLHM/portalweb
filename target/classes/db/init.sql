-- 删除测试数据
DELETE FROM tbl_sms_message;

-- 删除表
DROP TABLE IF EXISTS tbl_sms_message;
DROP TABLE IF EXISTS tbl_undelivery_mobile_no;
DROP TABLE IF EXISTS tbl_undelivery_account;
DROP TABLE IF EXISTS undeliverable_accounts;
DROP TABLE IF EXISTS undeliverable_reasons;
DROP TABLE IF EXISTS operation_logs;

-- 删除索引
DROP INDEX IF EXISTS idx_account;
DROP INDEX IF EXISTS idx_reason_id;
DROP INDEX IF EXISTS idx_last_update;
DROP INDEX IF EXISTS idx_operation_type;
DROP INDEX IF EXISTS idx_module;
DROP INDEX IF EXISTS idx_created_at;
DROP INDEX IF EXISTS idx_ac_no;
DROP INDEX IF EXISTS idx_mobile_number;
DROP INDEX IF EXISTS idx_account_number;
DROP INDEX IF EXISTS idx_sms_ac_no;
DROP INDEX IF EXISTS idx_sms_status;
DROP INDEX IF EXISTS idx_sms_send_time;

-- 创建表
-- 原因表
CREATE TABLE undeliverable_reasons (
    id BIGINT PRIMARY KEY,
    description TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 账户表
CREATE TABLE undeliverable_accounts (
    id BIGINT PRIMARY KEY,
    account VARCHAR(100) NOT NULL,
    reason_id BIGINT NOT NULL,
    last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
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

-- 未投递手机号表
CREATE TABLE tbl_undelivery_mobile_no (
    id BIGINT PRIMARY KEY,
    ac_no VARCHAR(100) NOT NULL,
    reason VARCHAR(200),
    mobile_number VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 未投递账户表
CREATE TABLE tbl_undelivery_account (
    id BIGINT PRIMARY KEY,
    account_number VARCHAR(100) NOT NULL,
    account_name VARCHAR(200),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
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
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 添加索引
CREATE INDEX idx_account ON undeliverable_accounts(account);
CREATE INDEX idx_reason_id ON undeliverable_accounts(reason_id);
CREATE INDEX idx_last_update ON undeliverable_accounts(last_update);
CREATE INDEX idx_operation_type ON operation_logs(operation_type);
CREATE INDEX idx_module ON operation_logs(module);
CREATE INDEX idx_created_at ON operation_logs(created_at);
CREATE INDEX idx_ac_no ON tbl_undelivery_mobile_no(ac_no);
CREATE INDEX idx_mobile_number ON tbl_undelivery_mobile_no(mobile_number);
CREATE INDEX idx_account_number ON tbl_undelivery_account(account_number);
CREATE INDEX idx_sms_ac_no ON tbl_sms_message(ac_no);
CREATE INDEX idx_sms_status ON tbl_sms_message(status);
CREATE INDEX idx_sms_send_time ON tbl_sms_message(send_time);

-- 插入SMS消息测试数据
INSERT INTO tbl_sms_message (id, ac_no, mobile_number, content, status, reason, send_time) VALUES
(1, 'ACC001', '12345678901', 'Test message 1', 'fail', 'Invalid number', '2024-03-20 10:00:00'),
(2, 'ACC002', '12345678902', 'Test message 2', 'fail', 'Number blocked', '2024-03-20 10:15:00'),
(3, 'ACC003', '12345678903', 'Test message 3', 'fail', 'Network error', '2024-03-20 10:30:00'),
(4, 'ACC004', '12345678904', 'Test message 4', 'success', NULL, '2024-03-20 10:45:00'),
(5, 'ACC001', '12345678901', 'Test message 5', 'fail', 'Invalid number', '2024-03-21 09:00:00'),
(6, 'ACC005', '12345678905', 'Test message 6', 'fail', 'Number not reachable', '2024-03-21 09:15:00'),
(7, 'ACC006', '12345678906', 'Test message 7', 'success', NULL, '2024-03-21 09:30:00'),
(8, 'ACC002', '12345678902', 'Test message 8', 'fail', 'Number blocked', '2024-03-21 09:45:00'),
(9, 'ACC007', '12345678907', 'Test message 9', 'fail', 'Invalid number', '2024-03-21 10:00:00'),
(10, 'ACC008', '12345678908', 'Test message 10', 'fail', 'Network error', '2024-03-21 10:15:00'),
(11, 'ACC009', '12345678909', 'Test message 11', 'success', NULL, '2024-03-21 10:30:00'),
(12, 'ACC010', '12345678910', 'Test message 12', 'fail', 'Number not reachable', '2024-03-21 10:45:00'),
(13, 'ACC003', '12345678903', 'Test message 13', 'fail', 'Network error', '2024-03-22 09:00:00'),
(14, 'ACC011', '12345678911', 'Test message 14', 'fail', 'Invalid number', '2024-03-22 09:15:00'),
(15, 'ACC012', '12345678912', 'Test message 15', 'fail', 'Number blocked', '2024-03-22 09:30:00'); 