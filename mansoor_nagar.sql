-- =====================================================
-- IMPORT DATA FOR AREA: Mansoor Nagar
-- =====================================================

DO $$
DECLARE
    v_area_id UUID;
    v_cust_id UUID;
    v_area_name TEXT := 'Mansoor Nagar';
    v_area_code TEXT := 'MANSOOR_NAGAR';
BEGIN
    -- Ensure area exists
    INSERT INTO areas (area_id, name)
    VALUES (v_area_code, v_area_name)
    ON CONFLICT (area_id) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_area_id;


    -- Customer: Safdar (C9)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C9', 'Safdar', 'C9@gmail.com', '0349-0560079', 'Mansoor Nagar', v_area_id, ARRAY['Sunday', 'Wednesday'], 2, 0, -600.0, -600.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C9', 'C9@gmail.com', 'Devine@C9', 'Safdar', 'customer', '0349-0560079', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Moiz (C11)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C11', 'Moiz', 'C11@gmail.com', '0312-2282169', 'Mansoor Nagar', v_area_id, ARRAY['Sunday', 'Wednesday'], 0, 0, -880.0, -880.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C11', 'C11@gmail.com', 'Devine@C11', 'Moiz', 'customer', '0312-2282169', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Moon (C12)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C12', 'Moon', 'C12@gmail.com', '0318-2411711', 'Mansoor Nagar', v_area_id, ARRAY['Sunday', 'Wednesday'], 0, 0, -640.0, -640.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C12', 'C12@gmail.com', 'Devine@C12', 'Moon', 'customer', '0318-2411711', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Abdullah (C24)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C24', 'Abdullah', 'C24@gmail.com', '0313-2427307', 'Mansoor Nagar', v_area_id, ARRAY['Sunday', 'Wednesday'], 0, 0, -400.0, -400.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C24', 'C24@gmail.com', 'Devine@C24', 'Abdullah', 'customer', '0313-2427307', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Al Harmain School (C26)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C26', 'Al Harmain School', 'C26@gmail.com', '0323-0217494', 'Mansoor Nagar', v_area_id, ARRAY['Monday', 'Thursday', 'Saturday'], 3, 0, 0.0, 0.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C26', 'C26@gmail.com', 'Devine@C26', 'Al Harmain School', 'customer', '0323-0217494', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Ghulam Safdar (C28)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C28', 'Ghulam Safdar', 'C28@gmail.com', '0315-2911056', 'Mansoor Nagar', v_area_id, ARRAY['Sunday', 'Wednesday'], 0, 0, -400.0, -400.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C28', 'C28@gmail.com', 'Devine@C28', 'Ghulam Safdar', 'customer', '0315-2911056', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Abdullah Pappu (C29)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C29', 'Abdullah Pappu', 'C29@gmail.com', NULL, 'Mansoor Nagar', v_area_id, ARRAY['Sunday', 'Wednesday'], 2, 0, 0.0, 0.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C29', 'C29@gmail.com', 'Devine@C29', 'Abdullah Pappu', 'customer', NULL, v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Farhan Pappu (C32)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C32', 'Farhan Pappu', 'C32@gmail.com', '0341-3147923', 'Mansoor Nagar', v_area_id, ARRAY['Sunday', 'Wednesday'], 3, 0, 240.0, 240.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C32', 'C32@gmail.com', 'Devine@C32', 'Farhan Pappu', 'customer', '0341-3147923', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Malik Asad (C33)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C33', 'Malik Asad', 'C33@gmail.com', '0333-3651512', 'Mansoor Nagar', v_area_id, ARRAY['Monday', 'Thursday', 'Saturday'], 2, 0, -1360.0, -1360.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C33', 'C33@gmail.com', 'Devine@C33', 'Malik Asad', 'customer', '0333-3651512', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Munna(Moon) (C34)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C34', 'Munna(Moon)', 'C34@gmail.com', '0315-1045691', 'Mansoor Nagar', v_area_id, ARRAY['Sunday', 'Wednesday'], 1, 0, -560.0, -560.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C34', 'C34@gmail.com', 'Devine@C34', 'Munna(Moon)', 'customer', '0315-1045691', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Hassan (C37)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C37', 'Hassan', 'C37@gmail.com', '0211-1822565', 'Mansoor Nagar', v_area_id, ARRAY['Sunday', 'Wednesday'], 2, 0, 0.0, 0.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C37', 'C37@gmail.com', 'Devine@C37', 'Hassan', 'customer', '0211-1822565', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Naeem (C48)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('C48', 'Naeem', 'C48@gmail.com', NULL, 'Mansoor Nagar', v_area_id, ARRAY['Monday', 'Thursday', 'Saturday'], 3, 0, -1680.0, -1680.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('C48', 'C48@gmail.com', 'Devine@C48', 'Naeem', 'customer', NULL, v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;

END $$;