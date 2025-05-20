-- Database rebuild schema
-- Create the account table
CREATE TABLE IF NOT EXISTS public.account (
    account_id SERIAL PRIMARY KEY,
    account_firstname VARCHAR(50) NOT NULL,
    account_lastname VARCHAR(50) NOT NULL,
    account_email VARCHAR(100) UNIQUE NOT NULL,
    account_password VARCHAR(255) NOT NULL,
    account_type VARCHAR(20) DEFAULT 'Client'
);

-- Create the classification table
CREATE TABLE IF NOT EXISTS public.classification (
    classification_id SERIAL PRIMARY KEY,
    classification_name VARCHAR(50) UNIQUE NOT NULL
);

-- Create the inventory table
CREATE TABLE IF NOT EXISTS public.inventory (
    inv_id SERIAL PRIMARY KEY,
    inv_make VARCHAR(50) NOT NULL,
    inv_model VARCHAR(50) NOT NULL,
    inv_description TEXT,
    inv_image VARCHAR(255),
    inv_thumbnail VARCHAR(255),
    classification_id INT NOT NULL REFERENCES classification(classification_id)
);

-- --------------------------------------------------------------------------

--  Query schemas for 'Tony Stark'
-- 1. Insert Tony Stark into the account table (account_id and account_type are handled automatically)
INSERT INTO public.account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

-- 2. Modify Tony Stark’s account_type to 'Admin'
UPDATE public.account
SET account_type = 'Admin'
WHERE account_email = 'tony@starkent.com';

-- ------------------------------------------------------------------------
-- 3. Delete Tony Stark’s record from the database
DELETE FROM public.account
WHERE account_email = 'tony@starkent.com';

-- ---------------------------------------------------------------------------

-- 4. Modify "GM Hummer" record to update description from 'small interiors' to 'a huge interior'
UPDATE public.inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

-- --------------------------------------------------------------
-- 5. Select make, model, and classification for "Sport" vehicles
SELECT inv_make, inv_model, classification_name
FROM public.inventory
INNER JOIN public.classification
ON inventory.classification_id = classification.classification_id
WHERE classification_name = 'Sport';

-- 6. Update all inventory image paths to include "/vehicles"
UPDATE public.inventory
SET inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/'),
    inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/')
WHERE inv_thumbnail LIKE '/images/%' AND inv_thumbnail NOT LIKE '/images/vehicles/%'
  AND inv_image LIKE '/images/%' AND inv_image NOT LIKE '/images/vehicles/%';
-- ---------------------------------------------------------------------------------------


