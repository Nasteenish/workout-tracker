-- Newtech Wellness equipment catalog
-- Product lines: M-Torture (plate-loaded), OnHim (selectorized), Advanced Line (selectorized), Cable/Functional, Benches, Racks
-- 99 records (IDs 672-770)

INSERT INTO equipment_catalog (id, brand, model, name, muscle_group, equipment_type, exercise_type, image_url) VALUES

-- =============================================
-- M-TORTURE SERIES (Plate-Loaded)
-- =============================================

-- Back
(672, 'Newtech', 'T-HR', 'M-Torture High Row', 'back', 'plate-loaded', 'high_row', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/T-HR.png'),
(673, 'Newtech', 'T-SR', 'M-Torture Seated Row', 'back', 'plate-loaded', 'seated_row', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/T-SR.png'),
(674, 'Newtech', 'T-FR', 'M-Torture Front Row', 'back', 'plate-loaded', 'seated_row', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/T-FR.png'),
(675, 'Newtech', 'T-LR2', 'M-Torture Low Row (Rotary)', 'back', 'plate-loaded', 'seated_row', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/T-LR2.png'),
(676, 'Newtech', 'T-2WR', 'M-Torture 2 Way Row', 'back', 'plate-loaded', 'seated_row', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/T-2WR.png'),
(677, 'Newtech', 'T-BOR', 'M-Torture Bentover Row', 'back', 'plate-loaded', 'seated_row', NULL),
(678, 'Newtech', 'T-VPD', 'M-Torture Vertical Pulldown', 'back', 'plate-loaded', 'lat_pulldown', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/T-VPD.png'),
(679, 'Newtech', 'T-WPF', 'M-Torture Wide Pulldown Front', 'back', 'plate-loaded', 'lat_pulldown', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/T-WPF.png'),
(680, 'Newtech', 'T-WPR', 'M-Torture Wide Pulldown Rear', 'back', 'plate-loaded', 'lat_pulldown', NULL),
(681, 'Newtech', 'T-WPR2', 'M-Torture Wide Pulldown Rear 2', 'back', 'plate-loaded', 'lat_pulldown', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/T-WPR2.png'),

-- Chest
(682, 'Newtech', 'T-WCP', 'M-Torture Wide Chest Press', 'chest', 'plate-loaded', 'chest_press', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/T-WCP.png'),
(683, 'Newtech', 'T-SCP', 'M-Torture Seated Chest Press (Rotary)', 'chest', 'plate-loaded', 'chest_press', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/T-SCP.png'),
(684, 'Newtech', 'T-ICP', 'M-Torture Incline Chest Press', 'chest', 'plate-loaded', 'incline_press', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/T-ICP.png'),
(685, 'Newtech', 'T-CDC', 'M-Torture Chest & Decline Combo', 'chest', 'plate-loaded', 'chest_press,decline_press', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/T-CDC.png'),
(686, 'Newtech', 'T-PDF', 'M-Torture Pec Dec Fly', 'chest', 'plate-loaded', 'chest_fly', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/T-PDF.png'),
(687, 'Newtech', 'T-PDRC', 'M-Torture Pec Dec Rear Combo', 'chest', 'plate-loaded', 'chest_fly,rear_delt', NULL),

-- Shoulders
(688, 'Newtech', 'T-SP', 'M-Torture Shoulder Press', 'shoulders', 'plate-loaded', 'shoulder_press', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/T-SP.png'),
(689, 'Newtech', 'T-LTR', 'M-Torture Lateral Raise', 'shoulders', 'plate-loaded', 'lateral_raise', NULL),

-- Arms
(690, 'Newtech', 'T-AC', 'M-Torture Arm Curl', 'arms', 'plate-loaded', 'bicep_curl', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/T-AC.png'),
(691, 'Newtech', 'T-OHE', 'M-Torture Overhead Extension', 'arms', 'plate-loaded', 'tricep_extension', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/T-OHE.png'),

-- Legs
(692, 'Newtech', 'T-PLP', 'M-Torture Power Leg Press (Thomson)', 'legs', 'plate-loaded', 'leg_press', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/T-PLP.png'),
(693, 'Newtech', 'T-PLPP', 'M-Torture Power Leg Press Premium (Thomson)', 'legs', 'plate-loaded', 'leg_press', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/T-PLPP.png'),
(694, 'Newtech', 'T-HS', 'M-Torture Hack Squat (Thomson)', 'legs', 'plate-loaded', 'hack_squat', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/T-HS.png'),
(695, 'Newtech', 'T-HSP', 'M-Torture Hack Squat Premium (Thomson)', 'legs', 'plate-loaded', 'hack_squat', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/T-HSP.png'),
(696, 'Newtech', 'T-HP', 'M-Torture Hack Press (Thomson)', 'legs', 'plate-loaded', 'hack_squat', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/T-HP.png'),
(697, 'Newtech', 'T-DS', 'M-Torture Drop Squat', 'legs', 'plate-loaded', 'squat', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/T-DS.png'),
(698, 'Newtech', 'T-VS', 'M-Torture V-Squat', 'legs', 'plate-loaded', 'squat', NULL),
(699, 'Newtech', 'T-BS', 'M-Torture Belt Squat', 'legs', 'plate-loaded', 'squat', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/T-BS.png'),
(700, 'Newtech', 'T-SCR', 'M-Torture Squat & Calf Raise', 'legs', 'plate-loaded', 'squat,calf', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/T-SCR.png'),
(701, 'Newtech', 'T-LE', 'M-Torture Leg Extension', 'legs', 'plate-loaded', 'leg_extension', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/T-LE.png'),
(702, 'Newtech', 'T-LC', 'M-Torture Leg Curl', 'legs', 'plate-loaded', 'leg_curl', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/T-LC.png'),
(703, 'Newtech', 'T-KLC', 'M-Torture Kneeling Leg Curl', 'legs', 'plate-loaded', 'leg_curl', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/T-KLC.png'),

-- Glutes
(704, 'Newtech', 'T-HT', 'M-Torture Hip Thrust (Rotary)', 'glutes', 'plate-loaded', 'hip_thrust', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/T-HT.png'),
(705, 'Newtech', 'T-RH', 'M-Torture Reverse Hyper', 'glutes', 'plate-loaded', 'reverse_hyper', NULL),
(706, 'Newtech', 'T-GH', 'M-Torture Glute Ham', 'glutes', 'plate-loaded', 'glute_ham_raise', NULL),
(707, 'Newtech', 'T-GKB', 'M-Torture Glute Kick-Back', 'glutes', 'plate-loaded', 'hip_extension', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/T-GKB.png'),
(708, 'Newtech', 'T-GKB2', 'M-Torture Glute Kick-Back 2', 'glutes', 'plate-loaded', 'hip_extension', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/T-GKB2.png'),

-- =============================================
-- ONHIM SERIES (Selectorized)
-- =============================================

-- Back
(709, 'Newtech', 'OH-SR', 'OnHim Seated Row', 'back', 'selectorized', 'seated_row', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/OH-SR.png'),
(710, 'Newtech', 'OH-SRO', 'OnHim Seated Row (Outward)', 'back', 'selectorized', 'seated_row', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/OH-SRO.png'),
(711, 'Newtech', 'OH-SRI', 'OnHim Seated Row (Inward)', 'back', 'selectorized', 'seated_row', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/OH-SRI.png'),
(712, 'Newtech', 'OH-LP', 'OnHim Lat Pulldown (High Pulley)', 'back', 'selectorized', 'lat_pulldown', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/OH-LP.png'),
(713, 'Newtech', 'OH-SSRC', 'OnHim Standing & Seated Row Combo', 'back', 'selectorized', 'seated_row', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/OH-SSRC.png'),

-- Chest
(714, 'Newtech', 'OH-SCP', 'OnHim Seated Chest Press (Rotary)', 'chest', 'selectorized', 'chest_press', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/OH-SCP.png'),
(715, 'Newtech', 'OH-ICP', 'OnHim Incline Chest Press', 'chest', 'selectorized', 'incline_press', NULL),
(716, 'Newtech', 'OH-PDFW', 'OnHim Pec Dec Fly (With Reverse)', 'chest', 'selectorized', 'chest_fly,rear_delt', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/OH-PDFW.png'),
(717, 'Newtech', 'OH-SFCB', 'OnHim Standing Fly Chest & Back', 'chest', 'selectorized', 'chest_fly,rear_delt', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/OH-SFCB.png'),
(718, 'Newtech', 'OH-SD', 'OnHim Seated Dip', 'chest', 'selectorized', 'chest_dip', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/OH-SD.png'),

-- Shoulders
(719, 'Newtech', 'OH-SP', 'OnHim Shoulder Press', 'shoulders', 'selectorized', 'shoulder_press', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/OH-SP.png'),
(720, 'Newtech', 'OH-STLR', 'OnHim Standing Lateral Raise', 'shoulders', 'selectorized', 'lateral_raise', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/OH-STLR.png'),
(721, 'Newtech', 'OH-SLR', 'OnHim Seated Lateral Raise', 'shoulders', 'selectorized', 'lateral_raise', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/OH-SLR.png'),
(722, 'Newtech', 'OH-SNLR', 'OnHim Single Lateral Raise', 'shoulders', 'selectorized', 'lateral_raise', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/OH-SNLR.png'),

-- Arms
(723, 'Newtech', 'OH-AC', 'OnHim Arm Curl', 'arms', 'selectorized', 'bicep_curl', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/OH-AC.png'),

-- Legs
(724, 'Newtech', 'OH-SLP', 'OnHim Seated Leg Press (Thomson)', 'legs', 'selectorized', 'leg_press', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/OH-SLP.png'),
(725, 'Newtech', 'OH-LE', 'OnHim Leg Extension', 'legs', 'selectorized', 'leg_extension', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/OH-LE.png'),
(726, 'Newtech', 'OH-LC', 'OnHim Leg Curl', 'legs', 'selectorized', 'leg_curl', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/OH-LC.png'),
(727, 'Newtech', 'OH-SLC', 'OnHim Seated Leg Curl', 'legs', 'selectorized', 'leg_curl', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/OH-SLC.png'),
(728, 'Newtech', 'OH-SCR', 'OnHim Standing Calf Raise', 'legs', 'selectorized', 'calf', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/OH-SCR.png'),

-- Glutes
(729, 'Newtech', 'OH-HAC', 'OnHim Hip Adduction/Abduction Combo', 'glutes', 'selectorized', 'hip_abduction,hip_adduction', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/OH-HAC.png'),
(730, 'Newtech', 'OH-HAS', 'OnHim Hip Abduction (Single Move)', 'glutes', 'selectorized', 'hip_abduction', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/OH-HAS.png'),
(731, 'Newtech', 'OH-KHR', 'OnHim Kneeling Hip Raise', 'glutes', 'selectorized', 'hip_extension', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/OH-KHR.png'),
(732, 'Newtech', 'OH-RH', 'OnHim Reverse Hyper', 'glutes', 'selectorized', 'reverse_hyper', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/OH-RH.png'),
(733, 'Newtech', 'OH-GH', 'OnHim Glute Ham', 'glutes', 'selectorized', 'glute_ham_raise', NULL),
(734, 'Newtech', 'OH-GKB', 'OnHim Glute Kick-Back', 'glutes', 'selectorized', 'hip_extension', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/OH-GKB.png'),

-- Core
(735, 'Newtech', 'OH-RT', 'OnHim Rotary Torso', 'core', 'selectorized', 'rotary_torso', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/OH-RT.png'),

-- Multi
(736, 'Newtech', 'OH-CDA', 'OnHim Chin-Up Dip Assist (Thomson)', 'full_body', 'selectorized', 'chest_dip,lat_pulldown', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/OH-CDA.png'),
(737, 'Newtech', 'OH-ALP', 'OnHim Adjustable Low Pulley', 'full_body', 'cable', 'cable_multi', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/OH-ALP.png'),

-- =============================================
-- ADVANCED LINE (Selectorized)
-- =============================================
(738, 'Newtech', 'ADV-SFCB', 'Advanced Line Standing Fly Chest & Back', 'chest', 'selectorized', 'chest_fly,rear_delt', NULL),
(739, 'Newtech', 'ADV-SR', 'Advanced Line Seated Row', 'back', 'selectorized', 'seated_row', NULL),
(740, 'Newtech', 'ADV-LLP', 'Advanced Line Long Pull (Low Pulley)', 'back', 'selectorized', 'seated_row', NULL),
(741, 'Newtech', 'ADV-LP', 'Advanced Line Lat Pulldown', 'back', 'selectorized', 'lat_pulldown', NULL),
(742, 'Newtech', 'ADV-SP', 'Advanced Line Shoulder Press', 'shoulders', 'selectorized', 'shoulder_press', NULL),
(743, 'Newtech', 'ADV-AC', 'Advanced Line Arm Curl', 'arms', 'selectorized', 'bicep_curl', NULL),
(744, 'Newtech', 'ADV-SD', 'Advanced Line Seated Dip', 'chest', 'selectorized', 'chest_dip', NULL),
(745, 'Newtech', 'ADV-RT', 'Advanced Line Rotary Torso', 'core', 'selectorized', 'rotary_torso', NULL),
(746, 'Newtech', 'ADV-AB', 'Advanced Line Abdominal Machine', 'core', 'selectorized', 'crunch', NULL),
(747, 'Newtech', 'ADV-LE', 'Advanced Line Leg Extension', 'legs', 'selectorized', 'leg_extension', NULL),
(748, 'Newtech', 'ADV-LC', 'Advanced Line Leg Curl', 'legs', 'selectorized', 'leg_curl', NULL),
(749, 'Newtech', 'ADV-SLP', 'Advanced Line Seated Leg Press', 'legs', 'selectorized', 'leg_press', NULL),

-- =============================================
-- CABLE / FUNCTIONAL
-- =============================================
(750, 'Newtech', 'C-CCO', 'Cable Cross Over', 'full_body', 'cable', 'cable_multi', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/C-CCO.png'),
(751, 'Newtech', 'C-DP', 'Dual Pulley', 'full_body', 'cable', 'cable_multi', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/C-DP.png'),
(752, 'Newtech', 'C-MP', 'Multi Pulley', 'full_body', 'cable', 'cable_multi', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/C-MP.png'),
(753, 'Newtech', 'C-TC', 'Tri Cable', 'full_body', 'cable', 'cable_multi', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/C-TC.png'),
(754, 'Newtech', 'C-TC4', 'Tri Cable 4 Station', 'full_body', 'cable', 'cable_multi', NULL),
(755, 'Newtech', 'C-TC6', 'Tri Cable 6 Station', 'full_body', 'cable', 'cable_multi', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/C-TC6.png'),
(756, 'Newtech', 'C-MG8', 'MultiGym Pro 8 Station', 'full_body', 'functional', 'cable_multi', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/C-MG8.png'),

-- =============================================
-- BENCHES & SPECIALTY
-- =============================================
(757, 'Newtech', 'F-TBR', 'T-Bar Row', 'back', 'plate-loaded', 'bent_row', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/F-TBR.png'),
(758, 'Newtech', 'F-SCR', 'Seated Calf Raise', 'legs', 'plate-loaded', 'calf', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/F-SCR.png'),
(759, 'Newtech', 'F-GHD', '90° Roman Chair (GHD)', 'core', 'bench', 'back_extension', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/F-GHD.png'),
(760, 'Newtech', 'F-DLR', 'Dip & Leg Raise', 'full_body', 'rack', 'chest_dip,crunch', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/F-DLR.png'),
(761, 'Newtech', 'F-SU', 'Sit Up', 'core', 'bench', 'crunch', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/F-SU.png'),
(762, 'Newtech', 'F-PSP', 'Plate Shoulder Press', 'shoulders', 'plate-loaded', 'shoulder_press', NULL),
(763, 'Newtech', 'F-PDB', 'Plate Decline Bench', 'chest', 'bench', 'decline_press', NULL),
(764, 'Newtech', 'F-PIB', 'Plate Incline Bench', 'chest', 'bench', 'incline_press', NULL),
(765, 'Newtech', 'F-PFB', 'Plate Flat Bench', 'chest', 'bench', 'chest_press', NULL),
(766, 'Newtech', 'F-HTB', 'Hip Thrust Bench', 'glutes', 'bench', 'hip_thrust', NULL),

-- =============================================
-- RACKS & SMITH MACHINES
-- =============================================
(767, 'Newtech', 'R-3DSH', '3D + Smith + Half Rack (Thomson)', 'full_body', 'smith', 'smith_machine,squat,shoulder_press,chest_press,incline_press', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/R-3DSH.png'),
(768, 'Newtech', 'R-3DR', '3D Rack (Thomson)', 'full_body', 'rack', 'squat,shoulder_press,chest_press', 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/newtech/R-3DR.png')

ON CONFLICT (id) DO UPDATE SET
  brand = EXCLUDED.brand,
  model = EXCLUDED.model,
  name = EXCLUDED.name,
  muscle_group = EXCLUDED.muscle_group,
  equipment_type = EXCLUDED.equipment_type,
  exercise_type = EXCLUDED.exercise_type,
  image_url = EXCLUDED.image_url;
