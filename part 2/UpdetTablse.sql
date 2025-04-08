USE familytree;
select * from people;


--  option one is to update the tree table only
INSERT INTO family_tree_connection (Person_Id, Relative_Id, Connection_Type)
SELECT
    p.Person_Id,
    f.Person_Id,
    CASE 
        WHEN p.Gender = 'Female' THEN 'Husband'  
        WHEN p.Gender = 'Male' THEN 'Wife' 
    END
FROM people p
JOIN people f ON p.Person_Id = f.Spouse_Id
WHERE p.Spouse_Id IS NULL 
AND f.Spouse_Id IS NOT NULL 
AND NOT EXISTS (
    SELECT 1 FROM family_tree_connection ft
    WHERE ft.Person_Id = p.Person_Id AND ft.Relative_Id = f.Person_Id
);
SELECT * FROM family_tree_connection


--  option two is to update the people table and then the tree
UPDATE people p
JOIN people f ON p.Person_Id = f.Spouse_Id
SET p.Spouse_Id = f.Person_Id
WHERE p.Spouse_Id IS NULL AND f.Spouse_Id IS NOT NULL;

INSERT INTO  family_tree_connection (Person_Id, Relative_Id, Connection_Type)
SELECT 
  p.Person_Id,
  f.Person_Id,
    CASE 
      WHEN p.Gender = 'Female' THEN 'Husband'  
	  WHEN p.Gender = 'Male' THEN 'Wife' 
    END
FROM people p
JOIN people f ON  p.Person_Id = f.Spouse_Id
WHERE p.Spouse_Id IS NOT NULL 
  AND f.Spouse_Id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 
    FROM family_tree_connection c
    WHERE c.Person_Id = p.Person_Id 
      AND c.Relative_Id = f.Person_Id
  );

Select * from family_tree_connection;



   
   
   

