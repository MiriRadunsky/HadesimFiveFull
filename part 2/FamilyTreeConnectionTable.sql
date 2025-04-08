USE  familytree;
CREATE TABLE family_tree_connection
 (
    Person_Id VARCHAR(50),
    Relative_Id VARCHAR(50),
    Connection_Type ENUM('Father', 'Mother', 'Brother', 'Sister', 'Son', 'Daughter', 'Husband', 'Wife'),
    PRIMARY KEY (Person_Id, Relative_Id),
    FOREIGN KEY (Person_Id) REFERENCES People(Person_Id) ON DELETE CASCADE,
    FOREIGN KEY (Relative_Id) REFERENCES People(Person_Id) ON DELETE CASCADE
);

INSERT INTO family_tree_connection (Person_Id, Relative_Id, Connection_Type)
SELECT 
    p.Person_Id, 
    p.Mother_Id, 
    'Mother'
FROM people p
JOIN people f ON f.Person_Id = p.Mother_Id
WHERE p.Mother_Id IS NOT NULL

UNION ALL

SELECT 
    p.Mother_Id, 
    p.Person_Id, 
    CASE 
        WHEN p.Gender = 'Male' THEN 'Son'
        WHEN p.Gender = 'Female' THEN 'Daughter'
    END
FROM people p
JOIN people f ON f.Person_Id = p.Mother_Id
WHERE p.Mother_Id IS NOT NULL;

INSERT INTO family_tree_connection (Person_Id, Relative_Id, Connection_Type)
SELECT 
    p.Person_Id, 
    p.Father_Id, 
    'Father'
FROM people p
JOIN people f ON f.Person_Id = p.Father_Id
WHERE p.Father_Id IS NOT NULL

UNION ALL

SELECT 
    p.Father_Id, 
    p.Person_Id, 
    CASE 
        WHEN p.Gender = 'Male' THEN 'Son'
        WHEN p.Gender = 'Female' THEN 'Daughter'
    END
FROM people p
JOIN people f ON f.Person_Id = p.Father_Id
WHERE p.Father_Id IS NOT NULL;


INSERT INTO family_tree_connection (Person_Id, Relative_Id, Connection_Type)
SELECT 
    p.Person_Id, 
    p.Spouse_Id,
    CASE
       WHEN p.Gender = 'Female' THEN 'Husband'  
       WHEN p.Gender = 'Male' THEN 'Wife' 
    END
FROM people p
JOIN people f ON f.Person_Id = p.Spouse_Id
WHERE p.Spouse_Id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 
    FROM family_tree_connection c
    WHERE c.Person_Id = p.Person_Id 
      AND c.Relative_Id = p.Spouse_Id
  );


INSERT INTO family_tree_connection (Person_Id, Relative_Id, Connection_Type)
SELECT 
    p.Person_Id, 
    f.Person_Id,
    CASE
       WHEN p.Gender = 'Female' THEN 'Sister'  
       WHEN p.Gender = 'Male' THEN 'Brother' 
    END
FROM people p
JOIN people f ON f.Father_Id = p.Father_Id AND f.Mother_Id = p.Mother_Id
WHERE p.Person_Id <> f.Person_Id  
AND p.Person_Id IS NOT NULL 
AND f.Person_Id IS NOT NULL;

SELECT * FROM family_tree_connection












