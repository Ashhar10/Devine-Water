-- =====================================================
-- IMPORT DATA FOR AREA: Dabba Mor to Islam Chowk
-- =====================================================

DO $$
DECLARE
    v_area_id UUID;
    v_cust_id UUID;
    v_area_name TEXT := 'Dabba Mor to Islam Chowk';
    v_area_code TEXT := 'DABBA_MOR';
BEGIN
    -- Ensure area exists
    INSERT INTO areas (area_id, name)
    VALUES (v_area_code, v_area_name)
    ON CONFLICT (area_id) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_area_id;


    -- Customer: Arif Iqbal (Home) (D1)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D1', 'Arif Iqbal (Home)', 'D1@gmail.com', '0315-2336297', 'Rehmat Chowk', v_area_id, ARRAY['Monday', 'Thursday', 'Saturday'], 1, 0, -1370.0, -1370.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D1', 'D1@gmail.com', 'Devine@D1', 'Arif Iqbal (Home)', 'customer', '0315-2336297', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Shahryar Dabba Mor (D19)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D19', 'Shahryar Dabba Mor', 'D19@gmail.com', '0300-2853933', 'Dabba Mor', v_area_id, ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], 5, 0, -4770.0, -4770.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D19', 'D19@gmail.com', 'Devine@D19', 'Shahryar Dabba Mor', 'customer', '0300-2853933', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Abid (D56)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D56', 'Abid', 'D56@gmail.com', '0315-2420763', 'Dabba Mor', v_area_id, ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], 5, 0, -21730.0, -21730.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D56', 'D56@gmail.com', 'Devine@D56', 'Abid', 'customer', '0315-2420763', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Zeeshan Dabba Mor (D4)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D4', 'Zeeshan Dabba Mor', 'D4@gmail.com', '0312-5311988', 'Dabba Mor', v_area_id, ARRAY['Saturday', 'Tuesday'], 0, 0, -1800.0, -1800.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D4', 'D4@gmail.com', 'Devine@D4', 'Zeeshan Dabba Mor', 'customer', '0312-5311988', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Arif Iqbal (School) (D5)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D5', 'Arif Iqbal (School)', 'D5@gmail.com', '0315-2336297', 'Rehmat Chowk', v_area_id, ARRAY['Monday', 'Thursday', 'Saturday'], 2, 0, -1700.0, -1700.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D5', 'D5@gmail.com', 'Devine@D5', 'Arif Iqbal (School)', 'customer', '0315-2336297', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Kamran Madni Masjid (D6)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D6', 'Kamran Madni Masjid', 'D6@gmail.com', '0331-2487553', 'Benazir Colony', v_area_id, ARRAY['Monday', 'Thursday', 'Saturday'], 1, 0, -2110.0, -2110.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D6', 'D6@gmail.com', 'Devine@D6', 'Kamran Madni Masjid', 'customer', '0331-2487553', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Arsalan Dabba Mor (D7)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D7', 'Arsalan Dabba Mor', 'D7@gmail.com', '0321-1217574', 'Dabba Mor', v_area_id, ARRAY['Saturday', 'Tuesday'], 1, 0, -1050.0, -1050.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D7', 'D7@gmail.com', 'Devine@D7', 'Arsalan Dabba Mor', 'customer', '0321-1217574', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Naeem (D8)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D8', 'Naeem', 'D8@gmail.com', '0314-2264699', 'Rehmat Chowk', v_area_id, ARRAY['Monday', 'Thursday', 'Saturday'], 1, 0, -1050.0, -1050.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D8', 'D8@gmail.com', 'Devine@D8', 'Naeem', 'customer', '0314-2264699', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Shakir (D9)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D9', 'Shakir', 'D9@gmail.com', '0315-2495195', 'Dabba Mor', v_area_id, ARRAY['Saturday', 'Tuesday'], 3, 0, -270.0, -270.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D9', 'D9@gmail.com', 'Devine@D9', 'Shakir', 'customer', '0315-2495195', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Tariq Bhai (D10)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D10', 'Tariq Bhai', 'D10@gmail.com', '0322-8782561', '1k', v_area_id, ARRAY['Monday', 'Thursday', 'Saturday'], 1, 0, -90.0, -90.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D10', 'D10@gmail.com', 'Devine@D10', 'Tariq Bhai', 'customer', '0322-8782561', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Faizan Police (D11)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D11', 'Faizan Police', 'D11@gmail.com', '0345-2248831', 'Dabba Mor', v_area_id, ARRAY['Saturday', 'Tuesday'], 1, 0, -2010.0, -2010.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D11', 'D11@gmail.com', 'Devine@D11', 'Faizan Police', 'customer', '0345-2248831', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Kamran Bhai T&T (D12)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D12', 'Kamran Bhai T&T', 'D12@gmail.com', '0321-8950252', 'T&T', v_area_id, ARRAY['Monday', 'Thursday'], 1, 0, -650.0, -650.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D12', 'D12@gmail.com', 'Devine@D12', 'Kamran Bhai T&T', 'customer', '0321-8950252', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Pappu Dairy (D62)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D62', 'Pappu Dairy', 'D62@gmail.com', '0323-2894884', 'Dabba Mor', v_area_id, ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], 5, 0, -90.0, -90.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D62', 'D62@gmail.com', 'Devine@D62', 'Pappu Dairy', 'customer', '0323-2894884', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Zulfiqar Ali (D14)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D14', 'Zulfiqar Ali', 'D14@gmail.com', '0314-2954505', 'Shia Quarter', v_area_id, ARRAY['Saturday', 'Tuesday'], 2, 0, -1620.0, -1620.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D14', 'D14@gmail.com', 'Devine@D14', 'Zulfiqar Ali', 'customer', '0314-2954505', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Farhan (Quarter) (D15)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D15', 'Farhan (Quarter)', 'D15@gmail.com', '0310-393733', 'Shia Quarter', v_area_id, ARRAY['Saturday', 'Tuesday'], 0, 0, 0.0, 0.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D15', 'D15@gmail.com', 'Devine@D15', 'Farhan (Quarter)', 'customer', '0310-393733', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Shamim Raza (D16)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D16', 'Shamim Raza', 'D16@gmail.com', '', 'Shia Quarter', v_area_id, ARRAY['Saturday', 'Tuesday'], 0, 0, -2700.0, -2700.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D16', 'D16@gmail.com', 'Devine@D16', 'Shamim Raza', 'customer', NULL, v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Imran Oil (D80)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D80', 'Imran Oil', 'D80@gmail.com', '', 'Dabba Mor', v_area_id, ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], 1, 0, 0.0, 0.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D80', 'D80@gmail.com', 'Devine@D80', 'Imran Oil', 'customer', NULL, v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Usama Rehmat chock (D18)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D18', 'Usama Rehmat chock', 'D18@gmail.com', '0311-2980058', 'Rehmat Chowk', v_area_id, ARRAY['Monday', 'Thursday', 'Saturday'], 1, 0, 110.0, 110.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D18', 'D18@gmail.com', 'Devine@D18', 'Usama Rehmat chock', 'customer', '0311-2980058', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Iftikhar Data Chowk (D71)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D71', 'Iftikhar Data Chowk', 'D71@gmail.com', '', 'Data Chowk', v_area_id, ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], 2, 0, -220.0, -220.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D71', 'D71@gmail.com', 'Devine@D71', 'Iftikhar Data Chowk', 'customer', NULL, v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Muhammad Yaseen (D20)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D20', 'Muhammad Yaseen', 'D20@gmail.com', '0333-2374416', 'T&T', v_area_id, ARRAY['Sunday', 'Tuesday', 'Thursday'], 2, 0, -1380.0, -1380.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D20', 'D20@gmail.com', 'Devine@D20', 'Muhammad Yaseen', 'customer', '0333-2374416', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Shayan (D21)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D21', 'Shayan', 'D21@gmail.com', '', 'Shia Quarter', v_area_id, ARRAY['Saturday', 'Tuesday'], 0, 0, -1380.0, -1380.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D21', 'D21@gmail.com', 'Devine@D21', 'Shayan', 'customer', NULL, v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Faizan Islam chock (D22)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D22', 'Faizan Islam chock', 'D22@gmail.com', '0336-3832886', 'Islam Chowk', v_area_id, ARRAY['Saturday'], 0, 0, -1040.0, -1040.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D22', 'D22@gmail.com', 'Devine@D22', 'Faizan Islam chock', 'customer', '0336-3832886', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Razi (D23)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D23', 'Razi', 'D23@gmail.com', '0313-2322167', 'Shia Quarter', v_area_id, ARRAY['Saturday', 'Tuesday'], 2, 0, -900.0, -900.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D23', 'D23@gmail.com', 'Devine@D23', 'Razi', 'customer', '0313-2322167', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Muhammad Zahid (D24)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D24', 'Muhammad Zahid', 'D24@gmail.com', '0340-8362466', 'L Block', v_area_id, ARRAY['Saturday'], 0, 0, -1600.0, -1600.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D24', 'D24@gmail.com', 'Devine@D24', 'Muhammad Zahid', 'customer', '0340-8362466', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Zeeshan Noorani (D25)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D25', 'Zeeshan Noorani', 'D25@gmail.com', '0347-2011898', 'Noorani', v_area_id, ARRAY['Saturday', 'Tuesday'], 1, 0, -90.0, -90.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D25', 'D25@gmail.com', 'Devine@D25', 'Zeeshan Noorani', 'customer', '0347-2011898', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: ASM Fassion (D81)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D81', 'ASM Fassion', 'D81@gmail.com', '0310-2200849', 'Data Chowk', v_area_id, ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], 3, 0, -2030.0, -2030.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D81', 'D81@gmail.com', 'Devine@D81', 'ASM Fassion', 'customer', '0310-2200849', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Shakil Bhai (D13)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D13', 'Shakil Bhai', 'D13@gmail.com', '0345-8220398', 'Ghaziabad', v_area_id, ARRAY['Sunday', 'Wednesday'], 2, 0, -520.0, -520.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D13', 'D13@gmail.com', 'Devine@D13', 'Shakil Bhai', 'customer', '0345-8220398', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: M. Saleem (Advo) (D28)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D28', 'M. Saleem (Advo)', 'D28@gmail.com', '0315-2275286', 'Dabba Mor', v_area_id, ARRAY['Saturday', 'Tuesday'], 0, 0, -2780.0, -2780.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D28', 'D28@gmail.com', 'Devine@D28', 'M. Saleem (Advo)', 'customer', '0315-2275286', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Shumail (D29)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D29', 'Shumail', 'D29@gmail.com', '', 'Dabba Mor to Islam Chowk', v_area_id, ARRAY['Monday', 'Thursday', 'Saturday'], 2, 0, -180.0, -180.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D29', 'D29@gmail.com', 'Devine@D29', 'Shumail', 'customer', NULL, v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: 1st Floor (D30)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D30', '1st Floor', 'D30@gmail.com', '0349-3641283', 'T&T', v_area_id, ARRAY['Sunday', 'Tuesday', 'Thursday'], 3, 0, -300.0, -300.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D30', 'D30@gmail.com', 'Devine@D30', '1st Floor', 'customer', '0349-3641283', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Haider (D31)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D31', 'Haider', 'D31@gmail.com', '0370-2405725', 'Islam Chowk', v_area_id, ARRAY['Monday', 'Thursday', 'Saturday'], 2, 0, -1620.0, -1620.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D31', 'D31@gmail.com', 'Devine@D31', 'Haider', 'customer', '0370-2405725', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Ata Ur Rehman (D26)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D26', 'Ata Ur Rehman', 'D26@gmail.com', '0313-2071346', 'Ghaziabad', v_area_id, ARRAY['Sunday', 'Wednesday'], 1, 0, -580.0, -580.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D26', 'D26@gmail.com', 'Devine@D26', 'Ata Ur Rehman', 'customer', '0313-2071346', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Sohail MCB (D33)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D33', 'Sohail MCB', 'D33@gmail.com', '0332-9067384', 'Safaid Chowk', v_area_id, ARRAY['Saturday', 'Tuesday'], 2, 0, -2860.0, -2860.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D33', 'D33@gmail.com', 'Devine@D33', 'Sohail MCB', 'customer', '0332-9067384', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Shabbir (D27)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D27', 'Shabbir', 'D27@gmail.com', '', 'Ghaziabad', v_area_id, ARRAY['Sunday', 'Wednesday'], 2, 0, -200.0, -200.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D27', 'D27@gmail.com', 'Devine@D27', 'Shabbir', 'customer', NULL, v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Meraj (D37)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D37', 'Meraj', 'D37@gmail.com', '0318-1154403', 'Ghaziabad', v_area_id, ARRAY['Sunday', 'Wednesday'], 0, 0, -420.0, -420.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D37', 'D37@gmail.com', 'Devine@D37', 'Meraj', 'customer', '0318-1154403', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Siddique (D36)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D36', 'Siddique', 'D36@gmail.com', '0306-0234338', 'Safaid Chowk', v_area_id, ARRAY['Saturday', 'Tuesday'], 2, 0, -180.0, -180.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D36', 'D36@gmail.com', 'Devine@D36', 'Siddique', 'customer', '0306-0234338', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Asad (G) (D38)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D38', 'Asad (G)', 'D38@gmail.com', '0301-3692399', 'Ghaziabad', v_area_id, ARRAY['Sunday', 'Wednesday'], 0, 0, -160.0, -160.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D38', 'D38@gmail.com', 'Devine@D38', 'Asad (G)', 'customer', '0301-3692399', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Maqsood (D42)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D42', 'Maqsood', 'D42@gmail.com', '0341-2429342', 'Ghaziabad', v_area_id, ARRAY['Sunday', 'Wednesday'], 2, 0, -1320.0, -1320.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D42', 'D42@gmail.com', 'Devine@D42', 'Maqsood', 'customer', '0341-2429342', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Syeda Aunty (D39)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D39', 'Syeda Aunty', 'D39@gmail.com', '0347-2692562', 'Shia Quarter', v_area_id, ARRAY['Saturday', 'Tuesday'], 2, 0, -820.0, -820.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D39', 'D39@gmail.com', 'Devine@D39', 'Syeda Aunty', 'customer', '0347-2692562', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Farhan Noorani (D40)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D40', 'Farhan Noorani', 'D40@gmail.com', '0336-0803650', 'Noorani', v_area_id, ARRAY['Saturday', 'Tuesday'], 0, 0, -480.0, -480.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D40', 'D40@gmail.com', 'Devine@D40', 'Farhan Noorani', 'customer', '0336-0803650', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Saad (D41)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D41', 'Saad', 'D41@gmail.com', '0340-2229366', 'Dabba Mor', v_area_id, ARRAY['Monday', 'Thursday', 'Saturday'], 3, 0, -1470.0, -1470.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D41', 'D41@gmail.com', 'Devine@D41', 'Saad', 'customer', '0340-2229366', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Zakir (D45)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D45', 'Zakir', 'D45@gmail.com', '0310-2321189', 'Ghaziabad', v_area_id, ARRAY['Sunday', 'Wednesday'], 1, 0, -980.0, -980.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D45', 'D45@gmail.com', 'Devine@D45', 'Zakir', 'customer', '0310-2321189', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Imran Ahmad Niazi (D43)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D43', 'Imran Ahmad Niazi', 'D43@gmail.com', '0331-3883484', 'T&T', v_area_id, ARRAY['Sunday', 'Tuesday', 'Thursday'], 2, 0, -1840.0, -1840.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D43', 'D43@gmail.com', 'Devine@D43', 'Imran Ahmad Niazi', 'customer', '0331-3883484', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Shakil Ansari (D44)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D44', 'Shakil Ansari', 'D44@gmail.com', '', 'Peela Quarter', v_area_id, ARRAY['Monday', 'Thursday', 'Saturday'], 1, 0, 0.0, 0.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D44', 'D44@gmail.com', 'Devine@D44', 'Shakil Ansari', 'customer', NULL, v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Muhammad Alam (D49)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D49', 'Muhammad Alam', 'D49@gmail.com', '', 'Ghaziabad', v_area_id, ARRAY['Sunday', 'Wednesday'], 1, 0, -540.0, -540.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D49', 'D49@gmail.com', 'Devine@D49', 'Muhammad Alam', 'customer', NULL, v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Irfan Hussain Shah (D46)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D46', 'Irfan Hussain Shah', 'D46@gmail.com', '0305-2068845', 'Shia Quarter', v_area_id, ARRAY['Saturday', 'Tuesday'], 2, 0, -1260.0, -1260.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D46', 'D46@gmail.com', 'Devine@D46', 'Irfan Hussain Shah', 'customer', '0305-2068845', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Iftikhar (D47)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D47', 'Iftikhar', 'D47@gmail.com', '0314-2339956', 'Shia Quarter', v_area_id, ARRAY['Saturday', 'Tuesday'], 1, 0, -810.0, -810.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D47', 'D47@gmail.com', 'Devine@D47', 'Iftikhar', 'customer', '0314-2339956', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Farhan Dabba Mor (D48)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D48', 'Farhan Dabba Mor', 'D48@gmail.com', '03341873320', 'Dabba Mor', v_area_id, ARRAY['Saturday', 'Tuesday'], 1, 0, -570.0, -570.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D48', 'D48@gmail.com', 'Devine@D48', 'Farhan Dabba Mor', 'customer', '03341873320', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Nimra Khursheed (D53)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D53', 'Nimra Khursheed', 'D53@gmail.com', '0370-2095703', 'Ghaziabad', v_area_id, ARRAY['Sunday', 'Wednesday'], 3, 0, -2300.0, -2300.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D53', 'D53@gmail.com', 'Devine@D53', 'Nimra Khursheed', 'customer', '0370-2095703', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Muhammad Shoaib (D50)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D50', 'Muhammad Shoaib', 'D50@gmail.com', '', 'Shia Quarter', v_area_id, ARRAY['Saturday', 'Tuesday'], 1, 0, -90.0, -90.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D50', 'D50@gmail.com', 'Devine@D50', 'Muhammad Shoaib', 'customer', NULL, v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Ahsan (D51)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D51', 'Ahsan', 'D51@gmail.com', '0310-2867591', 'Shia Quarter', v_area_id, ARRAY['Saturday', 'Tuesday'], 0, 0, -1280.0, -1280.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D51', 'D51@gmail.com', 'Devine@D51', 'Ahsan', 'customer', '0310-2867591', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Yazdan (D52)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D52', 'Yazdan', 'D52@gmail.com', '0340-8580177', 'T&T', v_area_id, ARRAY['Sunday', 'Tuesday', 'Thursday'], 2, 0, -1060.0, -1060.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D52', 'D52@gmail.com', 'Devine@D52', 'Yazdan', 'customer', '0340-8580177', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Sultan Ahmad (D54)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D54', 'Sultan Ahmad', 'D54@gmail.com', '', 'Ghaziabad', v_area_id, ARRAY['Sunday', 'Wednesday'], 2, 0, -520.0, -520.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D54', 'D54@gmail.com', 'Devine@D54', 'Sultan Ahmad', 'customer', NULL, v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Saif ud din (D75)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D75', 'Saif ud din', 'D75@gmail.com', '0345-3419545', 'Ghaziabad', v_area_id, ARRAY['Sunday', 'Wednesday'], 4, 0, -2080.0, -2080.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D75', 'D75@gmail.com', 'Devine@D75', 'Saif ud din', 'customer', '0345-3419545', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Kamal (D55)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D55', 'Kamal', 'D55@gmail.com', '0310-2357468', 'Rehmat Chowk', v_area_id, ARRAY['Monday', 'Thursday', 'Saturday'], 0, 0, -1040.0, -1040.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D55', 'D55@gmail.com', 'Devine@D55', 'Kamal', 'customer', '0310-2357468', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Bilal (D78)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D78', 'Bilal', 'D78@gmail.com', '', 'Ghaziabad', v_area_id, ARRAY['Sunday', 'Wednesday'], 1, 0, -100.0, -100.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D78', 'D78@gmail.com', 'Devine@D78', 'Bilal', 'customer', NULL, v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Mubeen (D57)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D57', 'Mubeen', 'D57@gmail.com', '', 'Rehmat Chowk', v_area_id, ARRAY['Saturday', 'Tuesday'], 0, 0, -280.0, -280.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D57', 'D57@gmail.com', 'Devine@D57', 'Mubeen', 'customer', NULL, v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Ayaz Ali (D58)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D58', 'Ayaz Ali', 'D58@gmail.com', '0317-8910063', 'Shia Quarter', v_area_id, ARRAY['Saturday', 'Tuesday'], 1, 0, -80.0, -80.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D58', 'D58@gmail.com', 'Devine@D58', 'Ayaz Ali', 'customer', '0317-8910063', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Wajahat (D59)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D59', 'Wajahat', 'D59@gmail.com', '0319-0356694', 'Rehmat Chowk', v_area_id, ARRAY['Monday', 'Thursday'], 0, 0, -720.0, -720.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D59', 'D59@gmail.com', 'Devine@D59', 'Wajahat', 'customer', '0319-0356694', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Murtaza (D60)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D60', 'Murtaza', 'D60@gmail.com', '0319-0356694', 'Rehmat Chowk', v_area_id, ARRAY['Monday', 'Thursday'], 0, 0, -320.0, -320.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D60', 'D60@gmail.com', 'Devine@D60', 'Murtaza', 'customer', '0319-0356694', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Anum State (D61)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D61', 'Anum State', 'D61@gmail.com', '', 'Dabba Mor', v_area_id, ARRAY['Monday', 'Thursday', 'Saturday'], 2, 0, -3380.0, -3380.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D61', 'D61@gmail.com', 'Devine@D61', 'Anum State', 'customer', NULL, v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Shahzaib Ashmil (D2)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D2', 'Shahzaib Ashmil', 'D2@gmail.com', '0311-8270585', 'Peela Quarter', v_area_id, ARRAY['Sunday', 'Wednesday'], 1, 0, -810.0, -810.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D2', 'D2@gmail.com', 'Devine@D2', 'Shahzaib Ashmil', 'customer', '0311-8270585', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Saeed (D63)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D63', 'Saeed', 'D63@gmail.com', '0300-2644707', 'T&T', v_area_id, ARRAY['Sunday', 'Tuesday', 'Thursday'], 2, 0, -180.0, -180.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D63', 'D63@gmail.com', 'Devine@D63', 'Saeed', 'customer', '0300-2644707', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Anas Akhtar (D64)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D64', 'Anas Akhtar', 'D64@gmail.com', '0332-2274536', 'Noorani', v_area_id, ARRAY['Saturday', 'Tuesday'], 0, 0, -1960.0, -1960.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D64', 'D64@gmail.com', 'Devine@D64', 'Anas Akhtar', 'customer', '0332-2274536', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Muhammad Ali (D65)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D65', 'Muhammad Ali', 'D65@gmail.com', '0315-2116949', 'Shia Quarter', v_area_id, ARRAY['Saturday', 'Tuesday'], 1, 0, -1210.0, -1210.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D65', 'D65@gmail.com', 'Devine@D65', 'Muhammad Ali', 'customer', '0315-2116949', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Imran Lal Masjid (D66)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D66', 'Imran Lal Masjid', 'D66@gmail.com', '03193419525', 'Dabba Mor', v_area_id, ARRAY['Saturday'], 0, 0, -400.0, -400.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D66', 'D66@gmail.com', 'Devine@D66', 'Imran Lal Masjid', 'customer', '03193419525', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Noman Dil Lagi (D67)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D67', 'Noman Dil Lagi', 'D67@gmail.com', '0321-2882254', 'Dil Lagi', v_area_id, ARRAY['Saturday', 'Tuesday'], 4, 0, -2600.0, -2600.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D67', 'D67@gmail.com', 'Devine@D67', 'Noman Dil Lagi', 'customer', '0321-2882254', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Dilshad (D68)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D68', 'Dilshad', 'D68@gmail.com', '0310-2319787', 'Rehmat Chowk', v_area_id, ARRAY['Monday', 'Thursday', 'Saturday'], 1, 0, -870.0, -870.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D68', 'D68@gmail.com', 'Devine@D68', 'Dilshad', 'customer', '0310-2319787', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Ahsaan (D69)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D69', 'Ahsaan', 'D69@gmail.com', '0316-2466472', 'Dabba Mor', v_area_id, ARRAY['Monday', 'Thursday', 'Saturday'], 0, 0, -640.0, -640.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D69', 'D69@gmail.com', 'Devine@D69', 'Ahsaan', 'customer', '0316-2466472', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Shahbaz Q (D70)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D70', 'Shahbaz Q', 'D70@gmail.com', '0316-4370162', 'Shia Quarter', v_area_id, ARRAY['Saturday', 'Tuesday'], 1, 0, -1370.0, -1370.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D70', 'D70@gmail.com', 'Devine@D70', 'Shahbaz Q', 'customer', '0316-4370162', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Naushad (D3)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D3', 'Naushad', 'D3@gmail.com', '0311-2938058', 'Peela Quarter', v_area_id, ARRAY['Sunday', 'Wednesday'], 3, 0, -1310.0, -1310.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D3', 'D3@gmail.com', 'Devine@D3', 'Naushad', 'customer', '0311-2938058', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Shahmeer (D72)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D72', 'Shahmeer', 'D72@gmail.com', '', 'Dabba Mor', v_area_id, ARRAY['Monday', 'Thursday', 'Saturday'], 1, 0, -90.0, -90.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D72', 'D72@gmail.com', 'Devine@D72', 'Shahmeer', 'customer', NULL, v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Waqeel Ansari (D73)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D73', 'Waqeel Ansari', 'D73@gmail.com', '', 'Peela Quarter', v_area_id, ARRAY['Monday', 'Thursday', 'Saturday'], 2, 0, 0.0, 0.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D73', 'D73@gmail.com', 'Devine@D73', 'Waqeel Ansari', 'customer', NULL, v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Qamar ud Din (D74)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D74', 'Qamar ud Din', 'D74@gmail.com', '0343-3454019', 'Dabba Mor', v_area_id, ARRAY['Saturday', 'Tuesday'], 3, 0, 1090.0, 1090.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D74', 'D74@gmail.com', 'Devine@D74', 'Qamar ud Din', 'customer', '0343-3454019', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Umair Ashmil (D17)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D17', 'Umair Ashmil', 'D17@gmail.com', '', 'Peela Quarter', v_area_id, ARRAY['Sunday', 'Wednesday'], 2, 0, -1060.0, -1060.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D17', 'D17@gmail.com', 'Devine@D17', 'Umair Ashmil', 'customer', NULL, v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Danish (D76)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D76', 'Danish', 'D76@gmail.com', '0331-3780469', 'Dabba Mor', v_area_id, ARRAY['Monday', 'Thursday', 'Saturday'], 0, 0, -720.0, -720.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D76', 'D76@gmail.com', 'Devine@D76', 'Danish', 'customer', '0331-3780469', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Shayan Shams (D77)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D77', 'Shayan Shams', 'D77@gmail.com', '0315-2960179', 'Noorani', v_area_id, ARRAY['Saturday', 'Tuesday'], 1, 0, -810.0, -810.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D77', 'D77@gmail.com', 'Devine@D77', 'Shayan Shams', 'customer', '0315-2960179', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: M.Bilal (D32)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D32', 'M.Bilal', 'D32@gmail.com', '0316-2794540', 'Peela Quarter', v_area_id, ARRAY['Sunday', 'Wednesday'], 0, 0, -800.0, -800.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D32', 'D32@gmail.com', 'Devine@D32', 'M.Bilal', 'customer', '0316-2794540', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Hasan Baloch (D34)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D34', 'Hasan Baloch', 'D34@gmail.com', '', 'Peela Quarter', v_area_id, ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], 2, 0, -1830.0, -1830.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D34', 'D34@gmail.com', 'Devine@D34', 'Hasan Baloch', 'customer', NULL, v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Rizwan (D79)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D79', 'Rizwan', 'D79@gmail.com', '0333-2365185', 'Peela Quarter', v_area_id, ARRAY['Sunday', 'Wednesday'], 0, 0, -720.0, -720.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D79', 'D79@gmail.com', 'Devine@D79', 'Rizwan', 'customer', '0333-2365185', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Imtiaz (D35)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D35', 'Imtiaz', 'D35@gmail.com', '0336-2067597', 'Rehmat Chowk', v_area_id, ARRAY['Sunday', 'Wednesday'], 2, 0, -980.0, -980.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D35', 'D35@gmail.com', 'Devine@D35', 'Imtiaz', 'customer', '0336-2067597', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Hamza (D82)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D82', 'Hamza', 'D82@gmail.com', '', 'Shia Quarter', v_area_id, ARRAY['Saturday', 'Tuesday'], 2, 0, -420.0, -420.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D82', 'D82@gmail.com', 'Devine@D82', 'Hamza', 'customer', NULL, v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Md. Shaharyar (D83)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D83', 'Md. Shaharyar', 'D83@gmail.com', '', 'Dabba Mor', v_area_id, ARRAY['Monday', 'Thursday', 'Saturday'], 1, 0, -330.0, -330.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D83', 'D83@gmail.com', 'Devine@D83', 'Md. Shaharyar', 'customer', NULL, v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Unknown (D84)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D84', 'Unknown', 'D84@gmail.com', '', 'Dabba Mor to Islam Chowk', v_area_id, ARRAY[]::text[], 0, 0, 0.0, 0.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D84', 'D84@gmail.com', 'Devine@D84', 'Unknown', 'customer', NULL, v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Unknown (D85)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('D85', 'Unknown', 'D85@gmail.com', '', 'Dabba Mor to Islam Chowk', v_area_id, ARRAY[]::text[], 0, 0, 0.0, 0.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('D85', 'D85@gmail.com', 'Devine@D85', 'Unknown', 'customer', NULL, v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;

END $$;