-- =====================================================
-- IMPORT DATA FOR AREA: Raisamrohi
-- =====================================================

DO $$
DECLARE
    v_area_id UUID;
    v_cust_id UUID;
    v_area_name TEXT := 'Raisamrohi';
    v_area_code TEXT := 'RAISAMROHI';
BEGIN
    -- Ensure area exists
    INSERT INTO areas (area_id, name)
    VALUES (v_area_code, v_area_name)
    ON CONFLICT (area_id) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_area_id;


    -- Customer: Laraib (R1)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('R1', 'Laraib', 'R1@gmail.com', '0331-0277710', 'Raisamrohi', v_area_id, ARRAY['Sunday', 'Wednesday'], 0, 0, -800.0, -800.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('R1', 'R1@gmail.com', 'Devine@R1', 'Laraib', 'customer', '0331-0277710', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Sani Raisamrohi (R2)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('R2', 'Sani Raisamrohi', 'R2@gmail.com', '0318-2053244', 'Raisamrohi', v_area_id, ARRAY['Sunday', 'Wednesday'], 1, 0, -1500.0, -1500.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('R2', 'R2@gmail.com', 'Devine@R2', 'Sani Raisamrohi', 'customer', '0318-2053244', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Faizan Raisamrohi (R3)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('R3', 'Faizan Raisamrohi', 'R3@gmail.com', '0324-2489438', 'Raisamrohi', v_area_id, ARRAY['Sunday', 'Wednesday'], 1, 0, -810.0, -810.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('R3', 'R3@gmail.com', 'Devine@R3', 'Faizan Raisamrohi', 'customer', '0324-2489438', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Mushtaq Police (R4)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('R4', 'Mushtaq Police', 'R4@gmail.com', '0312-2598334', 'Raisamrohi', v_area_id, ARRAY['Sunday', 'Wednesday'], 2, 0, -1000.0, -1000.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('R4', 'R4@gmail.com', 'Devine@R4', 'Mushtaq Police', 'customer', '0312-2598334', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Muzammil (R5)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('R5', 'Muzammil', 'R5@gmail.com', '0347-2272443', 'Raisamrohi', v_area_id, ARRAY['Sunday', 'Wednesday'], 2, 0, -120.0, -120.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('R5', 'R5@gmail.com', 'Devine@R5', 'Muzammil', 'customer', '0347-2272443', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Shahid bhai Raisamrohi (R6)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('R6', 'Shahid bhai Raisamrohi', 'R6@gmail.com', '0345-2917682', 'Raisamrohi', v_area_id, ARRAY['Sunday', 'Wednesday'], 1, 0, -1060.0, -1060.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('R6', 'R6@gmail.com', 'Devine@R6', 'Shahid bhai Raisamrohi', 'customer', '0345-2917682', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Jahangir (R7)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('R7', 'Jahangir', 'R7@gmail.com', '0322-8286787', 'Raisamrohi', v_area_id, ARRAY['Sunday', 'Wednesday'], 2, 0, -1240.0, -1240.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('R7', 'R7@gmail.com', 'Devine@R7', 'Jahangir', 'customer', '0322-8286787', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Manzoor Bhai (R8)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('R8', 'Manzoor Bhai', 'R8@gmail.com', '0312-9254808', 'Raisamrohi', v_area_id, ARRAY['Sunday', 'Wednesday'], 2, 0, -1480.0, -1480.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('R8', 'R8@gmail.com', 'Devine@R8', 'Manzoor Bhai', 'customer', '0312-9254808', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Rana Tehsin (R9)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('R9', 'Rana Tehsin', 'R9@gmail.com', '0325-3690903', 'Raisamrohi', v_area_id, ARRAY['Sunday', 'Wednesday'], 1, 0, -980.0, -980.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('R9', 'R9@gmail.com', 'Devine@R9', 'Rana Tehsin', 'customer', '0325-3690903', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Hamdan (R10)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('R10', 'Hamdan', 'R10@gmail.com', '0313-3012896', 'Raisamrohi', v_area_id, ARRAY['Sunday', 'Wednesday'], 4, 0, -1680.0, -1680.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('R10', 'R10@gmail.com', 'Devine@R10', 'Hamdan', 'customer', '0313-3012896', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Sharjeel (R11)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('R11', 'Sharjeel', 'R11@gmail.com', '0349-8497584', 'Raisamrohi', v_area_id, ARRAY['Sunday', 'Wednesday'], 2, 0, -1400.0, -1400.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('R11', 'R11@gmail.com', 'Devine@R11', 'Sharjeel', 'customer', '0349-8497584', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Naveed (R12)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('R12', 'Naveed', 'R12@gmail.com', '0322-3662758', 'Raisamrohi', v_area_id, ARRAY['Sunday', 'Wednesday'], 1, 0, -100.0, -100.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('R12', 'R12@gmail.com', 'Devine@R12', 'Naveed', 'customer', '0322-3662758', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Bilal yousaf (R13)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('R13', 'Bilal yousaf', 'R13@gmail.com', '0370-8720185', 'Raisamrohi', v_area_id, ARRAY['Sunday', 'Wednesday'], 1, 0, -100.0, -100.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('R13', 'R13@gmail.com', 'Devine@R13', 'Bilal yousaf', 'customer', '0370-8720185', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Rashid Bhai (R14)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('R14', 'Rashid Bhai', 'R14@gmail.com', '0315-6468617', 'Raisamrohi', v_area_id, ARRAY['Sunday', 'Wednesday'], 2, 0, -200.0, -200.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('R14', 'R14@gmail.com', 'Devine@R14', 'Rashid Bhai', 'customer', '0315-6468617', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Muhammad Athar (R15)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('R15', 'Muhammad Athar', 'R15@gmail.com', '0341-2899849', 'Raisamrohi', v_area_id, ARRAY['Sunday', 'Wednesday'], 1, 0, -890.0, -890.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('R15', 'R15@gmail.com', 'Devine@R15', 'Muhammad Athar', 'customer', '0341-2899849', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Ehtesham (R16)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('R16', 'Ehtesham', 'R16@gmail.com', '0313-2329669', 'Raisamrohi', v_area_id, ARRAY['Sunday', 'Wednesday'], 2, 0, -560.0, -560.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('R16', 'R16@gmail.com', 'Devine@R16', 'Ehtesham', 'customer', '0313-2329669', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Muhammad Yaqoob (R17)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('R17', 'Muhammad Yaqoob', 'R17@gmail.com', '0318-7723591', 'Raisamrohi', v_area_id, ARRAY['Sunday', 'Wednesday'], 0, 0, -2400.0, -2400.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('R17', 'R17@gmail.com', 'Devine@R17', 'Muhammad Yaqoob', 'customer', '0318-7723591', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Shahzad (R18)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('R18', 'Shahzad', 'R18@gmail.com', '0321-2136612', 'Raisamrohi', v_area_id, ARRAY['Sunday', 'Wednesday'], 2, 0, -1640.0, -1640.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('R18', 'R18@gmail.com', 'Devine@R18', 'Shahzad', 'customer', '0321-2136612', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Shahrukh (R19)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('R19', 'Shahrukh', 'R19@gmail.com', '0341-2380586', 'Raisamrohi', v_area_id, ARRAY['Sunday', 'Wednesday'], 1, 0, -90.0, -90.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('R19', 'R19@gmail.com', 'Devine@R19', 'Shahrukh', 'customer', '0341-2380586', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Usman (R20)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('R20', 'Usman', 'R20@gmail.com', '0343-2539516', 'Raisamrohi', v_area_id, ARRAY['Sunday', 'Wednesday'], 2, 0, -460.0, -460.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('R20', 'R20@gmail.com', 'Devine@R20', 'Usman', 'customer', '0343-2539516', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Aslam Baloch (R21)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('R21', 'Aslam Baloch', 'R21@gmail.com', '0333-3184971', 'Raisamrohi', v_area_id, ARRAY['Sunday', 'Wednesday'], 0, 0, 0.0, 0.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('R21', 'R21@gmail.com', 'Devine@R21', 'Aslam Baloch', 'customer', '0333-3184971', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Haji Ismail(Yaseen) (R22)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('R22', 'Haji Ismail(Yaseen)', 'R22@gmail.com', '0318-0228245', 'Raisamrohi', v_area_id, ARRAY['Sunday', 'Wednesday'], 2, 0, -760.0, -760.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('R22', 'R22@gmail.com', 'Devine@R22', 'Haji Ismail(Yaseen)', 'customer', '0318-0228245', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Rehan (R23)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('R23', 'Rehan', 'R23@gmail.com', '0336-2359596', 'Raisamrohi', v_area_id, ARRAY['Sunday', 'Wednesday'], 2, 0, -200.0, -200.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('R23', 'R23@gmail.com', 'Devine@R23', 'Rehan', 'customer', '0336-2359596', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Asif (R24)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('R24', 'Asif', 'R24@gmail.com', '0313-2590824', 'Raisamrohi', v_area_id, ARRAY['Sunday', 'Wednesday'], 0, 0, -160.0, -160.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('R24', 'R24@gmail.com', 'Devine@R24', 'Asif', 'customer', '0313-2590824', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Aftab Bhai (R25)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('R25', 'Aftab Bhai', 'R25@gmail.com', '0313-1212909', 'Raisamrohi', v_area_id, ARRAY['Sunday', 'Wednesday'], 6, 0, -1600.0, -1600.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('R25', 'R25@gmail.com', 'Devine@R25', 'Aftab Bhai', 'customer', '0313-1212909', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Zaheer (R26)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('R26', 'Zaheer', 'R26@gmail.com', '0315-0213617', 'Raisamrohi', v_area_id, ARRAY['Sunday', 'Wednesday'], 1, 0, -100.0, -100.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('R26', 'R26@gmail.com', 'Devine@R26', 'Zaheer', 'customer', '0315-0213617', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Yousaf (R27)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('R27', 'Yousaf', 'R27@gmail.com', '0319-3418858', 'Raisamrohi', v_area_id, ARRAY['Sunday', 'Wednesday'], 0, 0, 0.0, 0.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('R27', 'R27@gmail.com', 'Devine@R27', 'Yousaf', 'customer', '0319-3418858', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Hamayun (R28)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('R28', 'Hamayun', 'R28@gmail.com', '0312-0029312', 'Raisamrohi', v_area_id, ARRAY['Sunday', 'Wednesday'], 4, 0, -400.0, -400.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('R28', 'R28@gmail.com', 'Devine@R28', 'Hamayun', 'customer', '0312-0029312', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Inam (Nomi) (R29)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('R29', 'Inam (Nomi)', 'R29@gmail.com', '0313-0302060', 'Raisamrohi', v_area_id, ARRAY['Sunday', 'Wednesday'], 3, 0, -720.0, -720.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('R29', 'R29@gmail.com', 'Devine@R29', 'Inam (Nomi)', 'customer', '0313-0302060', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Khursheed (R30)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('R30', 'Khursheed', 'R30@gmail.com', '0333-1252369', 'Raisamrohi', v_area_id, ARRAY['Sunday', 'Wednesday'], 1, 0, -900.0, -900.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('R30', 'R30@gmail.com', 'Devine@R30', 'Khursheed', 'customer', '0333-1252369', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Wahab (R31)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('R31', 'Wahab', 'R31@gmail.com', '', 'Raisamrohi', v_area_id, ARRAY['Sunday', 'Wednesday'], 2, 0, -520.0, -520.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('R31', 'R31@gmail.com', 'Devine@R31', 'Wahab', 'customer', NULL, v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Hikmatullah (R32)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('R32', 'Hikmatullah', 'R32@gmail.com', '', 'Raisamrohi', v_area_id, ARRAY['Sunday', 'Wednesday'], 2, 0, -1400.0, -1400.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('R32', 'R32@gmail.com', 'Devine@R32', 'Hikmatullah', 'customer', NULL, v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;


    -- Customer: Jumma Khan (R33)
    INSERT INTO customers (customer_id, name, email, phone, address, area_id, delivery_days, required_bottles, outstanding_bottles, opening_balance, current_balance)
    VALUES ('R33', 'Jumma Khan', 'R33@gmail.com', '0311-2653699', 'Raisamrohi', v_area_id, ARRAY['Sunday', 'Wednesday'], 3, 0, -2580.0, -2580.0)
    ON CONFLICT (customer_id) DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        area_id = EXCLUDED.area_id
    RETURNING id INTO v_cust_id;

    IF v_cust_id IS NOT NULL THEN
        INSERT INTO users (user_id, email, password, name, role, phone, customer_id)
        VALUES ('R33', 'R33@gmail.com', 'Devine@R33', 'Jumma Khan', 'customer', '0311-2653699', v_cust_id)
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            customer_id = EXCLUDED.customer_id;
    END IF;

END $$;