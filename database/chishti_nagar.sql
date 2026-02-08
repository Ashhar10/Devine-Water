-- =====================================================
-- IMPORT DATA FOR AREA: Chishti Nagar
-- =====================================================

DO $$
DECLARE
    v_area_id UUID;
    v_cust_id UUID;
    v_area_name TEXT := 'Chishti Nagar';
    v_area_code TEXT := 'CHISHTI_NAGAR';
BEGIN
    -- Ensure area exists
    INSERT INTO areas (area_id, name)
    VALUES (v_area_code, v_area_name)
    ON CONFLICT (area_id) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_area_id;


    -- Customer: Shakil Bhai Jaan (C1)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C1', 'Shakil Bhai Jaan', 'C1@gmail.com', '0321-2503283', 'Chishti Nagar', v_area_id, ARRAY['Monday', 'Thursday'], 2, 0, -2640.0, -2640.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C1', 'C1@gmail.com', 'Devine@C1', 'Shakil Bhai Jaan', 'customer', '0321-2503283', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Shakil Bhai Hina (C2)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C2', 'Shakil Bhai Hina', 'C2@gmail.com', '0318-0124088', 'Chishti Nagar', v_area_id, ARRAY['Monday', 'Thursday'], 2, 0, -1040.0, -1040.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C2', 'C2@gmail.com', 'Devine@C2', 'Shakil Bhai Hina', 'customer', '0318-0124088', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Anmol Kali (C3)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C3', 'Anmol Kali', 'C3@gmail.com', '0310-4430600', 'Chishti Nagar', v_area_id, ARRAY[]::text[], 0, 0, -6140.0, -6140.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C3', 'C3@gmail.com', 'Devine@C3', 'Anmol Kali', 'customer', '0310-4430600', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Jameel (C4)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C4', 'Jameel', 'C4@gmail.com', '', 'Chishti Nagar', v_area_id, ARRAY['Monday', 'Thursday', 'Saturday'], 2, 0, 0.0, 0.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C4', 'C4@gmail.com', 'Devine@C4', 'Jameel', 'customer', NULL, v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Veradh (C5)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C5', 'Veradh', 'C5@gmail.com', '', 'Chishti Nagar', v_area_id, ARRAY['Monday', 'Wednesday', 'Thursday', 'Saturday'], 2, 0, 0.0, 0.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C5', 'C5@gmail.com', 'Devine@C5', 'Veradh', 'customer', NULL, v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Shahzaib Qadir (C6)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C6', 'Shahzaib Qadir', 'C6@gmail.com', '0313-2958559', 'Chishti Nagar', v_area_id, ARRAY['Monday', 'Thursday'], 2, 0, -1200.0, -1200.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C6', 'C6@gmail.com', 'Devine@C6', 'Shahzaib Qadir', 'customer', '0313-2958559', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Zahid Bhai (C7)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C7', 'Zahid Bhai', 'C7@gmail.com', '0312-3875824', 'Chishti Nagar', v_area_id, ARRAY['Monday', 'Thursday', 'Saturday'], 1, 0, -1680.0, -1680.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C7', 'C7@gmail.com', 'Devine@C7', 'Zahid Bhai', 'customer', '0312-3875824', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Shahid (C8)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C8', 'Shahid', 'C8@gmail.com', '0312-8543908', 'Chishti Nagar', v_area_id, ARRAY['Monday', 'Thursday', 'Saturday'], 5, 0, -1200.0, -1200.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C8', 'C8@gmail.com', 'Devine@C8', 'Shahid', 'customer', '0312-8543908', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Arsalan (C13)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C13', 'Arsalan', 'C13@gmail.com', '0334-3492388', 'Chishti Nagar', v_area_id, ARRAY['Monday', 'Thursday'], 2, 0, -1040.0, -1040.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C13', 'C13@gmail.com', 'Devine@C13', 'Arsalan', 'customer', '0334-3492388', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Rahat Mamo (C14)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C14', 'Rahat Mamo', 'C14@gmail.com', '0301-5873343', 'Chishti Nagar', v_area_id, ARRAY['Monday', 'Thursday'], 3, 0, 0.0, 0.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C14', 'C14@gmail.com', 'Devine@C14', 'Rahat Mamo', 'customer', '0301-5873343', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Barira Shahid (C16)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C16', 'Barira Shahid', 'C16@gmail.com', '', 'Chishti Nagar', v_area_id, ARRAY['Monday', 'Thursday', 'Saturday'], 1, 0, 0.0, 0.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C16', 'C16@gmail.com', 'Devine@C16', 'Barira Shahid', 'customer', NULL, v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Ammar Siddique (C17)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C17', 'Ammar Siddique', 'C17@gmail.com', '0310-2372018', 'Chishti Nagar', v_area_id, ARRAY['Saturday', 'Tuesday'], 3, 0, -1200.0, -1200.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C17', 'C17@gmail.com', 'Devine@C17', 'Ammar Siddique', 'customer', '0310-2372018', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Rizwan Chishti  Nagar (C18)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C18', 'Rizwan Chishti  Nagar', 'C18@gmail.com', '0331-2278339', 'Chishti Nagar', v_area_id, ARRAY['Monday', 'Wednesday', 'Thursday', 'Saturday'], 6, 0, 0.0, 0.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C18', 'C18@gmail.com', 'Devine@C18', 'Rizwan Chishti  Nagar', 'customer', '0331-2278339', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Imran Bhai Shahid (C19)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C19', 'Imran Bhai Shahid', 'C19@gmail.com', '0302-2004480', 'Chishti Nagar', v_area_id, ARRAY['Saturday', 'Tuesday'], 2, 0, -1200.0, -1200.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C19', 'C19@gmail.com', 'Devine@C19', 'Imran Bhai Shahid', 'customer', '0302-2004480', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Arfay (C21)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C21', 'Arfay', 'C21@gmail.com', '0341-1237963', 'Chishti Nagar', v_area_id, ARRAY['Monday', 'Wednesday', 'Thursday', 'Saturday'], 4, 0, -2760.0, -2760.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C21', 'C21@gmail.com', 'Devine@C21', 'Arfay', 'customer', '0341-1237963', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Nadir Khan (C22)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C22', 'Nadir Khan', 'C22@gmail.com', '0304-7091985', 'Chishti Nagar', v_area_id, ARRAY['Monday', 'Thursday'], 2, 0, -1120.0, -1120.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C22', 'C22@gmail.com', 'Devine@C22', 'Nadir Khan', 'customer', '0304-7091985', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Danish Solar (C23)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C23', 'Danish Solar', 'C23@gmail.com', '0312-2867640', 'Chishti Nagar', v_area_id, ARRAY['Saturday', 'Tuesday'], 1, 0, -320.0, -320.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C23', 'C23@gmail.com', 'Devine@C23', 'Danish Solar', 'customer', '0312-2867640', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Imran Siddique (C25)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C25', 'Imran Siddique', 'C25@gmail.com', '0333-9245552', 'Chishti Nagar', v_area_id, ARRAY['Saturday'], 0, 0, -480.0, -480.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C25', 'C25@gmail.com', 'Devine@C25', 'Imran Siddique', 'customer', '0333-9245552', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Tariq Naseem (C27)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C27', 'Tariq Naseem', 'C27@gmail.com', '0311-2134116', 'Chishti Nagar', v_area_id, ARRAY['Saturday', 'Tuesday'], 0, 0, -160.0, -160.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C27', 'C27@gmail.com', 'Devine@C27', 'Tariq Naseem', 'customer', '0311-2134116', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Qurban Bhai (C30)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C30', 'Qurban Bhai', 'C30@gmail.com', '', 'Chishti Nagar', v_area_id, ARRAY['Monday', 'Thursday', 'Saturday'], 2, 0, -1200.0, -1200.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C30', 'C30@gmail.com', 'Devine@C30', 'Qurban Bhai', 'customer', NULL, v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Shahnawaz (C36)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C36', 'Shahnawaz', 'C36@gmail.com', '0332-3163346', 'Chishti Nagar', v_area_id, ARRAY['Monday', 'Thursday', 'Saturday'], 2, 0, 580.0, 580.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C36', 'C36@gmail.com', 'Devine@C36', 'Shahnawaz', 'customer', '0332-3163346', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Raja Asghar (C38)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C38', 'Raja Asghar', 'C38@gmail.com', '0312-2451031', 'Chishti Nagar', v_area_id, ARRAY['Monday', 'Thursday', 'Saturday'], 1, 0, 0.0, 0.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C38', 'C38@gmail.com', 'Devine@C38', 'Raja Asghar', 'customer', '0312-2451031', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Irshad (C39)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C39', 'Irshad', 'C39@gmail.com', '0321-3911563', 'Chishti Nagar', v_area_id, ARRAY['Saturday', 'Tuesday'], 0, 0, -640.0, -640.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C39', 'C39@gmail.com', 'Devine@C39', 'Irshad', 'customer', '0321-3911563', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Saim (C41)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C41', 'Saim', 'C41@gmail.com', '0300-2019494', 'Chishti Nagar', v_area_id, ARRAY['Monday', 'Thursday', 'Saturday'], 1, 0, -880.0, -880.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C41', 'C41@gmail.com', 'Devine@C41', 'Saim', 'customer', '0300-2019494', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Amjad (C42)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C42', 'Amjad', 'C42@gmail.com', '0323-2313008', 'Chishti Nagar', v_area_id, ARRAY['Monday', 'Thursday', 'Saturday'], 1, 0, -720.0, -720.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C42', 'C42@gmail.com', 'Devine@C42', 'Amjad', 'customer', '0323-2313008', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Danial Alam (C44)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C44', 'Danial Alam', 'C44@gmail.com', '', 'Chishti Nagar', v_area_id, ARRAY['Saturday', 'Tuesday'], 1, 0, 0.0, 0.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C44', 'C44@gmail.com', 'Devine@C44', 'Danial Alam', 'customer', NULL, v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Rashid Ambar (C46)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C46', 'Rashid Ambar', 'C46@gmail.com', '03142790222', 'Chishti Nagar', v_area_id, ARRAY['Monday', 'Thursday'], 2, 0, -1200.0, -1200.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C46', 'C46@gmail.com', 'Devine@C46', 'Rashid Ambar', 'customer', '03142790222', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Sajid Bhai (C47)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C47', 'Sajid Bhai', 'C47@gmail.com', '03333114321', 'Chishti Nagar', v_area_id, ARRAY['Monday', 'Wednesday', 'Thursday', 'Saturday'], 1, 0, -1510.0, -1510.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C47', 'C47@gmail.com', 'Devine@C47', 'Sajid Bhai', 'customer', '03333114321', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Naqash (C51)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C51', 'Naqash', 'C51@gmail.com', '', 'Chishti Nagar', v_area_id, ARRAY['Monday', 'Thursday', 'Saturday'], 2, 0, -480.0, -480.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C51', 'C51@gmail.com', 'Devine@C51', 'Naqash', 'customer', NULL, v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Israr (C52)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C52', 'Israr', 'C52@gmail.com', '0312-8494262', 'Chishti Nagar', v_area_id, ARRAY['Monday', 'Thursday', 'Saturday'], 1, 0, 90.0, 90.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C52', 'C52@gmail.com', 'Devine@C52', 'Israr', 'customer', '0312-8494262', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Faraz (C53)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C53', 'Faraz', 'C53@gmail.com', '0340-7833913', 'Chishti Nagar', v_area_id, ARRAY['Monday', 'Thursday'], 0, 0, -800.0, -800.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C53', 'C53@gmail.com', 'Devine@C53', 'Faraz', 'customer', '0340-7833913', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Rukhsar (C54)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C54', 'Rukhsar', 'C54@gmail.com', '0316-2021209', 'Chishti Nagar', v_area_id, ARRAY['Monday'], 2, 0, -560.0, -560.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C54', 'C54@gmail.com', 'Devine@C54', 'Rukhsar', 'customer', '0316-2021209', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Ayaz (C55)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C55', 'Ayaz', 'C55@gmail.com', '', 'Chishti Nagar', v_area_id, ARRAY['Monday', 'Wednesday', 'Thursday', 'Saturday'], 1, 0, -2420.0, -2420.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C55', 'C55@gmail.com', 'Devine@C55', 'Ayaz', 'customer', NULL, v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Owais Naqash (C56)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C56', 'Owais Naqash', 'C56@gmail.com', '', 'Chishti Nagar', v_area_id, ARRAY['Sunday', 'Wednesday'], 0, 0, -560.0, -560.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C56', 'C56@gmail.com', 'Devine@C56', 'Owais Naqash', 'customer', NULL, v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Ibrahim (C57)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C57', 'Ibrahim', 'C57@gmail.com', '0333-1203337', 'Chishti Nagar', v_area_id, ARRAY['Monday', 'Wednesday', 'Thursday', 'Saturday'], 2, 0, -2400.0, -2400.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C57', 'C57@gmail.com', 'Devine@C57', 'Ibrahim', 'customer', '0333-1203337', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Irfan Anwar (C58)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C58', 'Irfan Anwar', 'C58@gmail.com', '0331-2355503', 'Chishti Nagar', v_area_id, ARRAY['Monday', 'Thursday', 'Saturday'], 0, 0, -480.0, -480.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C58', 'C58@gmail.com', 'Devine@C58', 'Irfan Anwar', 'customer', '0331-2355503', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Hassan Tariq (C60)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C60', 'Hassan Tariq', 'C60@gmail.com', '', 'Chishti Nagar', v_area_id, ARRAY['Monday', 'Thursday', 'Saturday'], 2, 0, -1360.0, -1360.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C60', 'C60@gmail.com', 'Devine@C60', 'Hassan Tariq', 'customer', NULL, v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Taha (C61)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C61', 'Taha', 'C61@gmail.com', '0321-2940365', 'Chishti Nagar', v_area_id, ARRAY['Monday', 'Thursday', 'Saturday'], 0, 0, -400.0, -400.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C61', 'C61@gmail.com', 'Devine@C61', 'Taha', 'customer', '0321-2940365', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: M. Saleem (C62)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C62', 'M. Saleem', 'C62@gmail.com', '0333-2190640', 'Chishti Nagar', v_area_id, ARRAY['Monday', 'Thursday', 'Saturday'], 0, 0, -560.0, -560.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C62', 'C62@gmail.com', 'Devine@C62', 'M. Saleem', 'customer', '0333-2190640', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Shani (C64)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C64', 'Shani', 'C64@gmail.com', '', 'Chishti Nagar', v_area_id, ARRAY['Monday', 'Thursday', 'Saturday'], 0, 0, 0.0, 0.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C64', 'C64@gmail.com', 'Devine@C64', 'Shani', 'customer', NULL, v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Masjid (C65)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C65', 'Masjid', 'C65@gmail.com', '', 'Chishti Nagar', v_area_id, ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], 0, 0, 0.0, 0.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C65', 'C65@gmail.com', 'Devine@C65', 'Masjid', 'customer', NULL, v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;

END $$;