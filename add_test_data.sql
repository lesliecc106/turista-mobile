-- Add some test establishments
INSERT INTO establishments (name, owner, contact, address, status) VALUES
('Mount Iriga Eco-Tourism Park', 'admin01', '0917-123-4567', 'Iriga City', 'approved'),
('Asog Falls Resort', 'admin01', '0917-234-5678', 'Iriga City', 'approved'),
('Iriga City Hotel', 'admin01', '0917-345-6789', 'San Nicolas, Iriga City', 'approved');

-- Add test attraction surveys
INSERT INTO attraction_surveys 
(survey_date, attraction_name, city, province, code, enumerator, visit_date, residence, purpose, transport, group_size, stay, nationality_data, owner)
VALUES
('2025-12-01', 'Mount Iriga', 'Iriga City', 'Camarines Sur', 'ATT-001', 'Juan Dela Cruz', '2025-12-01', 'Outside the Region but within the Country', 'Leisure / Recreation / Holiday', 'Private Vehicle', 4, 'Day Trip (No Overnight)', '[{"nat":"Philippines","count":4}]', 'admin01'),
('2025-12-05', 'Asog Falls', 'Iriga City', 'Camarines Sur', 'ATT-002', 'Maria Santos', '2025-12-05', 'Outside the Province but within the Region', 'Leisure / Recreation / Holiday', 'Public Transportation (Bus/Van)', 2, 'Day Trip (No Overnight)', '[{"nat":"Philippines","count":2}]', 'admin01'),
('2025-12-10', 'Mount Iriga', 'Iriga City', 'Camarines Sur', 'ATT-001', 'Pedro Garcia', '2025-12-10', 'Foreign Country', 'Leisure / Recreation / Holiday', 'Private Vehicle', 3, '2-3 Nights', '[{"nat":"United States","count":2},{"nat":"Japan","count":1}]', 'admin01');

-- Add test accommodation surveys
INSERT INTO accommodation_surveys
(survey_date, establishment_name, ae_type, num_rooms, city, province, enumerator, checkin_date, checkout_date, purpose, source, room_nights, transport, nationality_data, owner)
VALUES
('2025-12-01', 'Iriga City Hotel', 'Hotel', 25, 'Iriga City', 'Camarines Sur', 'Anna Cruz', '2025-12-01', '2025-12-03', 'Business / Professional', 'Walk-in', 2, 'Private Vehicle', '[{"nat":"Philippines","count":1,"nights":2}]', 'admin01'),
('2025-12-08', 'Iriga City Hotel', 'Hotel', 25, 'Iriga City', 'Camarines Sur', 'Jose Reyes', '2025-12-08', '2025-12-10', 'Leisure / Recreation / Holiday', 'Online Booking Platform', 4, 'Taxi / Ride-sharing', '[{"nat":"Korea, Republic of","count":2,"nights":2}]', 'admin01');

-- Add regional distribution data
INSERT INTO regional_distribution (origin, count, is_manual, owner) VALUES
('Philippines', 7, false, 'admin01'),
('United States', 2, false, 'admin01'),
('Japan', 1, false, 'admin01'),
('Korea, Republic of', 2, false, 'admin01');