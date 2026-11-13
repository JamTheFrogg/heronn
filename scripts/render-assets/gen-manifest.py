# python3 gen-manifest.py [catalogue.json]  -> public/products/manifest.json
# Maps every catalogue product id to a render key; byArt is the fallback for new products.
import json, sys, os
BY_ID = {
  **{i: 'bullet' for i in ['c01', 'c02', 'c03']}, 'c04': 'bullet-colour', 'c05': 'dome', 'c06': 'dome-vandal', 'c07': 'dome-vandal',
  'c08': 'turret', 'c09': 'ptz', 'c10': 'ptz', 'c11': 'cube', 'c12': 'pan-tilt', 'c13': 'battery-camera', 'c14': 'battery-camera',
  'c15': 'solar-camera', 'c16': 'solar-camera', 'c17': 'floodlight', 'c18': 'bullet-wifi', 'c19': 'cube-graphite',
  **{i: 'doorbell' for i in ['d01', 'd02', 'd03', 'd04']}, 'd05': 'doorbell-intercom',
  **{i: 'recorder' for i in ['r01', 'r02', 'r03']}, **{i: 'recorder-pro' for i in ['r04', 'r05', 'r06']},
  's01': 'motion-sensor', 's02': 'motion-sensor', 's05': 'motion-sensor', 's03': 'contact-sensor', 's04': 'puck-sensor', 's06': 'puck-sensor',
  'a01': 'alarm-hub', 'a02': 'alarm-hub', 'a03': 'siren', 'a04': 'siren',
  'l01': 'smart-lock', 'l02': 'keypad-lock', 'l03': 'fingerprint-lock',
}
BY_ART = {'bullet': 'bullet', 'dome': 'dome', 'ptz': 'ptz', 'cube': 'cube', 'solar': 'solar-camera', 'doorbell': 'doorbell',
          'recorder': 'recorder', 'sensor': 'motion-sensor', 'alarm': 'alarm-hub', 'lock': 'smart-lock'}
out = 'public/products/'
keys = sorted({*BY_ID.values(), *BY_ART.values()})
for k in keys: assert os.path.exists(out + k + '.webp') and os.path.exists(out + k + '@600.webp'), k
m = {'note': 'Rendered from code (three.js). image = /products/<key>.webp (1200x1200), small = /products/<key>@600.webp. Look up byId first, then byArt.',
     'background': 'rgb(245,243,240)', 'hero': '/products/hero-family.webp',
     'keys': {k: {'image': f'/products/{k}.webp', 'small': f'/products/{k}@600.webp'} for k in keys},
     'byId': BY_ID, 'byArt': BY_ART}
if len(sys.argv) > 1:
    cat = json.load(open(sys.argv[1])); miss = [p['id'] for p in cat if p['id'] not in BY_ID]
    print(f'coverage {len(cat) - len(miss)}/{len(cat)}', 'missing', miss)
json.dump(m, open(out + 'manifest.json', 'w'), indent=2)
print(len(BY_ID), 'ids,', len(keys), 'keys')
