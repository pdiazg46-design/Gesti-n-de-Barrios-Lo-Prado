-- Communities Table
CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  location_geom GEOGRAPHY(Point, 4326),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles / Neighbors Table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  neighborhood_id UUID REFERENCES communities(id),
  karma_pts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Items Table (Gifts, Sales, Swaps)
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES profiles(id),
  community_id UUID REFERENCES communities(id),
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12,2) DEFAULT 0,
  category TEXT,
  type TEXT CHECK (type IN ('GIFT', 'SALE', 'SWAP', 'SERVICE')),
  images TEXT[], -- URLs
  status TEXT DEFAULT 'AVAILABLE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions / Interactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES items(id),
  initiator_id UUID REFERENCES profiles(id),
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
