-- Update all Smith Machine equipment to support multiple exercise types
-- Smith machines are universal: squats, presses, lunges, calf raises, etc.
UPDATE equipment_catalog
SET exercise_type = 'smith_machine,squat,shoulder_press,chest_press,incline_press,lunge,calf'
WHERE exercise_type = 'smith_machine';
