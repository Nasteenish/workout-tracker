-- Add high_row tag to high row machines
UPDATE equipment_catalog
SET exercise_type = exercise_type || ',high_row'
WHERE model IN ('PL-ILHR', 'MTSHR', '4340')
  AND exercise_type NOT LIKE '%high_row%';

-- Add low_row tag to low row machines
UPDATE equipment_catalog
SET exercise_type = exercise_type || ',low_row'
WHERE model IN ('PL-ILLR', '4319', 'DSL0324')
  AND exercise_type NOT LIKE '%low_row%';

-- Cybex Ion Lat Pulldown / Low Row combo — add low_row
UPDATE equipment_catalog
SET exercise_type = exercise_type || ',low_row'
WHERE model = 'CI-LPR'
  AND exercise_type NOT LIKE '%low_row%';
