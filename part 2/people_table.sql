USE   familytreedb;
CREATE TABLE people  (
    Person_Id VARCHAR(9) PRIMARY KEY,
    Personal_Name VARCHAR(50),
    Family_Name VARCHAR(50),
    Gender ENUM('Male', 'Female'),
    Father_Id VARCHAR(9),
    Mother_Id VARCHAR(9),
    Spouse_Id VARCHAR(9),
    FOREIGN KEY (Father_Id) REFERENCES People(Person_Id) ON DELETE SET NULL,
    FOREIGN KEY (Mother_Id) REFERENCES People(Person_Id) ON DELETE SET NULL,
    FOREIGN KEY (Spouse_Id) REFERENCES People(Person_Id) ON DELETE SET NULL
);

INSERT INTO people (Person_Id, Personal_Name, Family_Name, Gender, Father_Id, Mother_Id) VALUES
('370123456', 'David', 'Cohen', 'Male', NULL, NULL),
('371234567', 'Maya', 'Cohen', 'Female', NULL, NULL),

('372345678', 'Yonatan', 'Cohen', 'Male', '370123456', '371234567'),
('373456789', 'Shira', 'Levi', 'Female', NULL, NULL),

('374567890', 'Daniel', 'Cohen', 'Male', '372345678', '373456789'),
('375678901', 'Tamar', 'Cohen', 'Female', '372345678', '373456789'),

('376789012', 'Oren', 'Ben-David', 'Male', NULL, NULL),
('377890123', 'Yaara', 'Ben-David', 'Female', NULL, NULL),

('378901234', 'Amir', 'Ben-David', 'Male', '376789012', '377890123'),
('379012345', 'Noga', 'Ben-David', 'Female', '376789012', '377890123'),

('380123456', 'Lior', 'Shapiro', 'Male', NULL, NULL),
('381234567', 'Ruth', 'Shapiro', 'Female', NULL, NULL),

('382345678', 'Eli', 'Shapiro', 'Male', '380123456', '381234567'),
('383456789', 'Ruth', 'Shapiro', 'Female', '380123456', '381234567'),

('384567890', 'Itai', 'Mizrahi', 'Male', NULL, NULL),
('385678901', 'Avigail', 'Mizrahi', 'Female', NULL, NULL),

('386789012', 'Matan', 'Mizrahi', 'Male', '384567890', '385678901'),
('387890123', 'Keren', 'Mizrahi', 'Female', '384567890', '385678901'),

('388901234', 'Gilad', 'Goldberg', 'Male', NULL, NULL),
('389012345', 'Tali', 'Goldberg', 'Female', NULL, NULL),

('390123456', 'Yaniv', 'Goldberg', 'Male', '388901234', '389012345'),
('391234567', 'Michal', 'Goldberg', 'Female', '388901234', '389012345'),

('392345678', 'Yoni', 'Aharon', 'Male', NULL, NULL),
('393456789', 'Michal', 'Aharon', 'Female', NULL, NULL),

('394567890', 'Barak', 'Aharon', 'Male', '392345678', '393456789'),
('395678901', 'Dana', 'Aharon', 'Female', '392345678', '393456789');


UPDATE People SET Spouse_Id = '371234567' WHERE Person_Id = '370123456';
UPDATE People SET Spouse_Id = '370123456' WHERE Person_Id = '371234567';
UPDATE People SET Spouse_Id = '373456789' WHERE Person_Id = '372345678';
UPDATE People SET Spouse_Id = '372345678' WHERE Person_Id = '373456789';
UPDATE People SET Spouse_Id = '377890123' WHERE Person_Id = '376789012';
UPDATE People SET Spouse_Id = '376789012' WHERE Person_Id = '377890123';
UPDATE People SET Spouse_Id = '381234567' WHERE Person_Id = '380123456';
UPDATE People SET Spouse_Id = '380123456' WHERE Person_Id = '381234567';
UPDATE People SET Spouse_Id = '385678901' WHERE Person_Id = '384567890';
UPDATE People SET Spouse_Id = '384567890' WHERE Person_Id = '385678901';
UPDATE People SET Spouse_Id = '389012345' WHERE Person_Id = '388901234';
UPDATE People SET Spouse_Id = '388901234' WHERE Person_Id = '389012345';
UPDATE People SET Spouse_Id = '393456789' WHERE Person_Id = '392345678';
UPDATE People SET Spouse_Id = '392345678' WHERE Person_Id = '393456789';

INSERT INTO people (Person_Id, Personal_Name, Family_Name, Gender, Father_Id, Mother_Id) VALUES
('395678981', 'Miri', 'Shalom', 'Female', NULL, NULL, '394567840'),
('394567840', 'Gil', 'Ron', 'Male', NULL, NULL, '395678981');
UPDATE People SET Spouse_Id = '394567840' WHERE Person_Id = '395678981';

