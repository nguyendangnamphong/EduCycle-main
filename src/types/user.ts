
export interface User {
  user_id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Member' | 'Representative';
  reputation_score: number;
  violation_count: number;
  rating: number;
  status: 'Active' | 'Banned';
  avatar?: string;
}

export type ItemType = 'Liquidation' | 'Exchange' | 'Donation';

export interface Post {
  post_id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  type: ItemType;
  product_type: string;
  status: 'Pending' | 'Approved' | 'Cancelled' | 'Completed';
  image?: string;
  
  // Additional properties needed by existing code
  id?: string;
  category?: string;
  seller?: string;
}

export type FundraiserType = 'ItemDonation' | 'ItemSale';

export interface Fundraiser {
  id: string;
  title: string;
  description: string;
  goalAmount: number;
  amountRaised: number;
  image: string;
  organizer: string;
  endDate: Date;
  participants: number;
  fundraiserType: FundraiserType;
  items?: Post[];
}

export type TransactionType = 'Sale' | 'Exchange' | 'Donation' | 'Fundraiser';

export interface Transaction {
  id: number;
  type: TransactionType;
  item: string;
  date: string;
  amount: string;
  status: 'Pending' | 'Completed' | 'In Progress' | 'Cancelled';
  counterpartyName?: string;
  itemId?: string;
}
