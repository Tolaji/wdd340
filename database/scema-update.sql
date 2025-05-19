-- Modify "GM Hummer" description
UPDATE public.inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

-- Update inventory image paths
UPDATE public.inventory
SET inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/'),
    inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/')
WHERE inv_thumbnail LIKE '/images/%' AND inv_thumbnail NOT LIKE '/images/vehicles/%'
  AND inv_image LIKE '/images/%' AND inv_image NOT LIKE '/images/vehicles/%';
