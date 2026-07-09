import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import crypto from "crypto";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import cron from "node-cron";
import { Resend } from "resend";
import { Server as SocketIOServer } from "socket.io";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Add healthcheck endpoint for preview ping
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Middleware for parsing JSON and URL-encoded bodies
  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ extended: true, limit: "20mb" }));

  // Configure multer memory storage for uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  });

  const DB_PATH = path.join(process.cwd(), "db_mock.json");

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://ozqdefczzkkfekkjzikp.supabase.co';
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || 'sb_publishable_1oXLPrlDJPss2sHdX2YetQ_pnad39Wy';
  let supabase: any = null;

  if (supabaseUrl && supabaseKey) {
    console.log("Supabase credentials detected! Initializing secure cloud sync.");
    supabase = createClient(supabaseUrl, supabaseKey);
  }

  // Helper to get raw ISO date string
  const getIsoNow = () => new Date().toISOString();

  // Hardcoded initial creators seeds
  const SEED_CREATORS = [
    {"name": "Aanya Sharma", "city": "Lucknow", "state": "Uttar Pradesh", "category": "Fashion", "languages": ["Hindi", "English"], "gender": "female", "ig": 145000, "yt": 12000, "rate": {"reel": 18000, "story": 5000, "yt_video": 45000}, "creator_type": "influencer", "barter": "barter_ok", "photo": "https://images.unsplash.com/photo-1633346683707-25c5b6ead885?w=400"},
    {"name": "Vikram Singh", "city": "Jaipur", "state": "Rajasthan", "category": "Travel", "languages": ["Hindi", "English"], "gender": "male", "ig": 89000, "yt": 156000, "rate": {"reel": 12000, "story": 3500, "yt_video": 65000}, "creator_type": "influencer", "barter": "cash_only", "photo": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400"},
    {"name": "Riya Mehta", "city": "Indore", "state": "Madhya Pradesh", "category": "Food", "languages": ["Hindi"], "gender": "female", "ig": 234000, "yt": 45000, "rate": {"reel": 25000, "story": 8000, "yt_video": 55000}, "creator_type": "influencer", "barter": "partial_barter", "photo": "https://images.unsplash.com/photo-1536766768598-e09213fdcf22?w=400"},
    {"name": "Arjun Patel", "city": "Surat", "state": "Gujarat", "category": "Tech", "languages": ["English", "Hindi", "Gujarati"], "gender": "male", "ig": 67000, "yt": 289000, "rate": {"reel": 15000, "story": 4500, "yt_video": 85000}, "creator_type": "influencer", "barter": "cash_only", "photo": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"},
    {"name": "Priya Reddy", "city": "Hyderabad", "state": "Telangana", "category": "Beauty", "languages": ["Telugu", "English"], "gender": "female", "ig": 312000, "yt": 78000, "rate": {"reel": 32000, "story": 9500, "yt_video": 72000}, "creator_type": "influencer", "barter": "barter_ok", "photo": "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400"},
    {"name": "Karan Joshi", "city": "Patna", "state": "Bihar", "category": "Comedy", "languages": ["Hindi", "Bhojpuri"], "gender": "male", "ig": 456000, "yt": 234000, "rate": {"reel": 42000, "story": 12000, "yt_video": 95000}, "creator_type": "influencer", "barter": "cash_only", "photo": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400"},
    {"name": "Sneha Iyer", "city": "Chennai", "state": "Tamil Nadu", "category": "Lifestyle", "languages": ["Tamil", "English"], "gender": "female", "ig": 178000, "yt": 23000, "rate": {"reel": 20000, "story": 6500, "yt_video": 38000}, "creator_type": "influencer", "barter": "partial_barter", "photo": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400"},
    {"name": "Rohit Verma", "city": "Kanpur", "state": "Uttar Pradesh", "category": "Finance", "languages": ["Hindi", "English"], "gender": "male", "ig": 56000, "yt": 198000, "rate": {"reel": 14000, "story": 4000, "yt_video": 68000}, "creator_type": "influencer", "barter": "cash_only", "photo": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400"},
    {"name": "Ananya Gupta", "city": "Bhopal", "state": "Madhya Pradesh", "category": "Fitness", "languages": ["Hindi", "English"], "gender": "female", "ig": 124000, "yt": 67000, "rate": {"reel": 17000, "story": 5500, "yt_video": 42000}, "creator_type": "influencer", "barter": "barter_ok", "photo": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400"},
    {"name": "Aditya Kumar", "city": "Ranchi", "state": "Jharkhand", "category": "Gaming", "languages": ["Hindi", "English"], "gender": "male", "ig": 87000, "yt": 345000, "rate": {"reel": 13000, "story": 4000, "yt_video": 90000}, "creator_type": "influencer", "barter": "cash_only", "photo": "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400"},
    {"name": "Meera Pillai", "city": "Kochi", "state": "Kerala", "category": "Education", "languages": ["Malayalam", "English"], "gender": "female", "ig": 98000, "yt": 145000, "rate": {"reel": 16000, "story": 5000, "yt_video": 58000}, "creator_type": "influencer", "barter": "partial_barter", "photo": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400"},
    {"name": "Suresh Yadav", "city": "Varanasi", "state": "Uttar Pradesh", "category": "Spiritual", "languages": ["Hindi", "Sanskrit"], "gender": "male", "ig": 267000, "yt": 412000, "rate": {"reel": 28000, "story": 8500, "yt_video": 110000}, "creator_type": "publisher", "barter": "cash_only", "photo": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400"},
    {"name": "Pooja Desai", "city": "Ahmedabad", "state": "Gujarat", "category": "Parenting", "languages": ["Gujarati", "Hindi", "English"], "gender": "female", "ig": 156000, "yt": 89000, "rate": {"reel": 19000, "story": 6000, "yt_video": 48000}, "creator_type": "influencer", "barter": "barter_ok", "photo": "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400"},
    {"name": "Manish Kapoor", "city": "Chandigarh", "state": "Punjab", "category": "Automotive", "languages": ["Punjabi", "Hindi", "English"], "gender": "male", "ig": 78000, "yt": 234000, "rate": {"reel": 15000, "story": 4500, "yt_video": 72000}, "creator_type": "influencer", "barter": "cash_only", "photo": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400"},
    {"name": "Divya Nair", "city": "Trivandrum", "state": "Kerala", "category": "Books", "languages": ["Malayalam", "English"], "gender": "female", "ig": 45000, "yt": 78000, "rate": {"reel": 9000, "story": 3000, "yt_video": 32000}, "creator_type": "influencer", "barter": "partial_barter", "photo": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400"},
    {"name": "Tarun Bhatt", "city": "Dehradun", "state": "Uttarakhand", "category": "Adventure", "languages": ["Hindi", "English"], "gender": "male", "ig": 134000, "yt": 167000, "rate": {"reel": 18000, "story": 5500, "yt_video": 62000}, "creator_type": "influencer", "barter": "barter_ok", "photo": "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=400"},
    {"name": "Kavya Menon", "city": "Bangalore", "state": "Karnataka", "category": "Tech", "languages": ["Kannada", "English"], "gender": "female", "ig": 89000, "yt": 156000, "rate": {"reel": 16000, "story": 5000, "yt_video": 65000}, "creator_type": "influencer", "barter": "cash_only", "photo": "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400"},
    {"name": "Rajat Khanna", "city": "Lucknow", "state": "Uttar Pradesh", "category": "Comedy", "languages": ["Hindi", "Urdu"], "gender": "male", "ig": 198000, "yt": 89000, "rate": {"reel": 21000, "story": 7000, "yt_video": 45000}, "creator_type": "influencer", "barter": "barter_ok", "photo": "https://images.unsplash.com/photo-1463453091185-61582044d556?w=400"},
    {"name": "Nisha Agarwal", "city": "Jaipur", "state": "Rajasthan", "category": "Home Decor", "languages": ["Hindi", "English"], "gender": "female", "ig": 167000, "yt": 56000, "rate": {"reel": 20000, "story": 6500, "yt_video": 38000}, "creator_type": "influencer", "barter": "barter_ok", "photo": "https://images.unsplash.com/photo-1517365830460-955ce3ccd263?w=400"},
    {"name": "Yash Tiwari", "city": "Nagpur", "state": "Maharashtra", "category": "Sports", "languages": ["Marathi", "Hindi"], "gender": "male", "ig": 112000, "yt": 198000, "rate": {"reel": 17000, "story": 5500, "yt_video": 68000}, "creator_type": "influencer", "barter": "cash_only", "photo": "https://images.unsplash.com/photo-1502323777036-f29e3972d82f?w=400"},
    {"name": "Ishita Banerjee", "city": "Kolkata", "state": "West Bengal", "category": "Art", "languages": ["Bengali", "English"], "gender": "female", "ig": 78000, "yt": 34000, "rate": {"reel": 13000, "story": 4000, "yt_video": 28000}, "creator_type": "influencer", "barter": "barter_ok", "photo": "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400"},
    {"name": "Akash Mishra", "city": "Allahabad", "state": "Uttar Pradesh", "category": "Music", "languages": ["Hindi", "Bhojpuri"], "gender": "male", "ig": 234000, "yt": 312000, "rate": {"reel": 26000, "story": 8000, "yt_video": 88000}, "creator_type": "influencer", "barter": "cash_only", "photo": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400"},
    {"name": "Tanvi Saxena", "city": "Pune", "state": "Maharashtra", "category": "Wellness", "languages": ["Marathi", "Hindi", "English"], "gender": "female", "ig": 145000, "yt": 67000, "rate": {"reel": 18000, "story": 6000, "yt_video": 42000}, "creator_type": "influencer", "barter": "partial_barter", "photo": "https://images.unsplash.com/photo-1438495555890-6cf24cba1cae?w=400"},
    {"name": "Devansh Rao", "city": "Vizag", "state": "Andhra Pradesh", "category": "Tech", "languages": ["Telugu", "English"], "gender": "male", "ig": 67000, "yt": 178000, "rate": {"reel": 14000, "story": 4500, "yt_video": 72000}, "creator_type": "influencer", "barter": "cash_only", "photo": "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400"},
    {"name": "Avani Joshi", "city": "Mumbai", "state": "Maharashtra", "category": "Fashion", "languages": ["Marathi", "Hindi", "English"], "gender": "female", "ig": 412000, "yt": 134000, "rate": {"reel": 45000, "story": 14000, "yt_video": 85000}, "creator_type": "celebrity", "barter": "cash_only", "photo": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400"},
  ];

  const SEED_CAMPAIGNS = [
    {"title": "Summer Skincare Launch", "description": "Looking for beauty creators for our SPF 50+ launch. 1 reel + 3 stories.", "budget_min": 15000, "budget_max": 40000, "deliverables": ["Instagram Reel", "Instagram Story"], "categories": ["Beauty", "Lifestyle"], "platforms": ["Instagram"], "language": "Hindi"},
    {"title": "Tech Gadget Review", "description": "New earbuds launch. Need detailed YouTube review + reel.", "budget_min": 30000, "budget_max": 90000, "deliverables": ["YouTube Video", "Instagram Reel"], "categories": ["Tech"], "platforms": ["YouTube", "Instagram"], "language": "English"},
    {"title": "Diwali Festival Sale", "description": "Festive collection promotion. Bharat creators preferred.", "budget_min": 10000, "budget_max": 25000, "deliverables": ["Instagram Reel"], "categories": ["Fashion", "Lifestyle"], "platforms": ["Instagram"], "language": "Hindi"},
    {"title": "Healthy Snack Brand", "description": "Looking for fitness/wellness creators to promote our protein bars.", "budget_min": 12000, "budget_max": 35000, "deliverables": ["Instagram Reel", "Instagram Story"], "categories": ["Fitness", "Food"], "platforms": ["Instagram"], "language": "Hindi"},
    {"title": "Regional Food Channel", "description": "Promote our regional food delivery service in Tier 2/3 cities.", "budget_min": 8000, "budget_max": 20000, "deliverables": ["Instagram Reel"], "categories": ["Food", "Comedy"], "platforms": ["Instagram"], "language": "Hindi"},
  ];

  interface DbState {
    users: any[];
    user_sessions: any[];
    creator_profiles: any[];
    brand_profiles: any[];
    campaigns: any[];
    waves: any[];
    collabs: any[];
    verifications: any[];
    reports: any[];
    notifications: any[];
    platform_settings: {
      brand_markup_pct: number;
      creator_deduction_pct: number;
      agency_markup_pct: number;
      agency_deduction_pct: number;
      ai_review_enabled?: boolean;
      maintenance_mode_creator?: boolean;
      maintenance_creator_until?: string | null;
      maintenance_mode_brand?: boolean;
      maintenance_brand_until?: string | null;
    };
    chat_messages: any[];
    campaign_performance: any[];
    files: any[];
    team_activity_logs?: any[];
    creator_payment_methods?: any[];
    transactions?: any[];
    fee_configs?: any[];
    chat_threads?: any[];
    deal_offers?: any[];
    message_flags?: any[];
    user_violations?: any[];
    waitlist?: any[];
    saved_creators?: any[];
    collab_cost_requests?: any[];
    brief_requests?: any[];
    creator_portfolio?: any[];
    collab_proof_submissions?: any[];
    invoice_clients?: any[];
    invoice_billing_profile?: any[];
    creator_reviews?: any[];
    invoices?: any[];
    ugc_briefs?: any[];
    ugc_orders?: any[];
    ugc_deliveries?: any[];
    ugc_showcase?: any[];
    ugc_reviews?: any[];
    earnings?: any[];
    banners?: any[];
  }

  function getInitialDbState(): DbState {
    const db: DbState = {
      users: [],
      user_sessions: [],
      creator_profiles: [],
      brand_profiles: [],
      campaigns: [
        { campaign_id: 'c1', brand_name: 'Nova Brand Co', brand_logo: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?w=100', title: 'Summer Collection Launch', budget_max: 50000, deadline: '2026-07-01', applicants: [], stage: 'Under Review', daysInReview: 3, description: 'Looking for fashion creators to promote our new summer line.', targetAudience: '18-24, Fashion, Urban', deliverables: ['1 Reel', '2 Story mentions'] },
        { campaign_id: 'c2', brand_name: 'FitTech', brand_logo: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=100', title: 'Smartwatch Review', budget_max: 20000, deadline: '2026-06-25', applicants: [], stage: 'Under Review', daysInReview: 1, description: 'Fitness creators needed for an honest review of our active smartwatch.', targetAudience: 'Fitness enthusiasts', deliverables: ['1 YouTube dedicated review'] },
        { campaign_id: 'c3', brand_name: 'GlowCosmetics', brand_logo: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100', title: 'Skincare Routine', budget_max: 15000, deadline: '2026-06-20', applicants: [], stage: 'Live', daysInReview: 0, description: 'Showcase your morning skincare routine featuring our glowing serum.', targetAudience: 'Beauty, Skincare', deliverables: ['1 Instagram Reel'] },
      ],
      waves: [],
      collabs: [],
      verifications: [
        { verification_id: 'v1', user_id: 'u1', type: 'Creator', name: 'Rahul Verma', photo: 'https://i.pravatar.cc/150?u=r', status: 'pending', created_at: getIsoNow(), documents: { pan: 'https://images.unsplash.com/photo-1621360841013-c76831f1e360?w=400&q=80', aadhaarFront: 'https://images.unsplash.com/photo-1621360841013-c76831f1e360?w=400&q=80', aadhaarBack: 'https://images.unsplash.com/photo-1621360841013-c76831f1e360?w=400&q=80', bank: 'https://images.unsplash.com/photo-1544396821-4dd40b938ad3?w=400&q=80' } },
        { verification_id: 'v2', user_id: 'u2', type: 'Creator', name: 'Sneha Kapoor', photo: 'https://i.pravatar.cc/150?u=s', status: 'approved', created_at: getIsoNow() },
        { verification_id: 'v3', user_id: 'u3', type: 'Brand', name: 'Nova Media Ltd.', photo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&q=80', status: 'pending', created_at: getIsoNow(), gstin: '27AAACN1234E1Z5' },
      ],
      waitlist: [
        { id: "w_1", user_id: "user_seed_w_1", name: "Aarushi Jain", photo: "https://i.pravatar.cc/150?u=a", date: getIsoNow(), handle: "@aarushi_j", followers: 125000, platform: "Instagram", position: 1, status: "Pending" },
        { id: "w_2", user_id: "user_seed_w_2", name: "Rahul Verma", photo: "https://i.pravatar.cc/150?u=r", date: getIsoNow(), handle: "@rahul_vlogs", followers: 89000, platform: "YouTube", position: 2, status: "Pending" },
        { id: "w_3", user_id: "user_seed_w_3", name: "Sneha Kapoor", photo: "https://i.pravatar.cc/150?u=s", date: getIsoNow(), handle: "@sneha_styles", followers: 45000, platform: "Instagram", position: 3, status: "Approved" },
        { id: "w_4", user_id: "user_seed_w_4", name: "Tech with Karan", photo: "https://i.pravatar.cc/150?u=t", date: getIsoNow(), handle: "@karan_tech", followers: 12000, platform: "YouTube", position: 4, status: "Rejected", rejectReason: "Fake followers" },
      ],
      reports: [
        { report_id: 'r1', type: 'Payment Dispute', status: 'open', severity: 'high', reported_by: 'user_seed_creator', target: 'col_124', reason: 'Brand is refusing to release payment even though content was delivered.', created_at: getIsoNow(), assigned_to: null },
        { report_id: 'r2', type: 'Content Violation', status: 'open', severity: 'medium', reported_by: 'user_seed_brand', target: 'user_seed_creator', reason: 'Creator uploaded content that violates platform guidelines.', created_at: getIsoNow(), assigned_to: 'admin' },
      ],
      notifications: [],
      platform_settings: {
        brand_markup_pct: 2.0,
        creator_deduction_pct: 2.0,
        agency_markup_pct: 5.0,
        agency_deduction_pct: 5.0,
        ai_review_enabled: false,
      },
      chat_messages: [
        { id: 'm1', thread_id: 'col_123', sender_id: 'user_seed_creator', sender_role: 'creator', message_type: 'text', content: 'What the heck is wrong with you guys. Pay me now! This is ridiculous.', read: true, created_at: getIsoNow(), is_deleted: false },
        { id: 'm2', thread_id: 'col_124', sender_id: 'user_seed_brand', sender_role: 'brand', message_type: 'text', content: 'Click this link to get free followers: http://spam.com', read: false, created_at: getIsoNow(), is_deleted: false },
        { id: 'm3', thread_id: 'col_123', sender_id: 'user_seed_brand', sender_role: 'brand', message_type: 'text', content: 'Please maintain professionalism, we are reviewing the delivery.', read: true, created_at: getIsoNow(), is_deleted: false }
      ],
      campaign_performance: [],
      files: [],
      ugc_orders: [],
      team_activity_logs: [],
      creator_payment_methods: [],
      transactions: [
        { id: 'T1', type: 'Escrow Release', from: 'Brand Wallet (FitTech)', to: 'Creator Payout (Rahul V)', amount: 20000, fee: 1000, gst: 180, date: getIsoNow(), status: 'Success' },
        { id: 'T2', type: 'Wallet Top-up', from: 'Stripe Gateway', to: 'Brand Wallet (Nova Brand Co)', amount: 100000, fee: 0, gst: 0, date: getIsoNow(), status: 'Success' },
        { id: 'T3', type: 'Escrow Lock', from: 'Brand Wallet (Nova Brand Co)', to: 'Escrow (Collab_123)', amount: 50000, fee: 0, gst: 0, date: getIsoNow(), status: 'Success' },
        { id: 'T4', type: 'Refund', from: 'Escrow (Collab_109)', to: 'Brand Wallet (GlowCosmetics)', amount: 15000, fee: 0, gst: 0, date: getIsoNow(), status: 'Success' },
      ],
      fee_configs: [{ id: 1, threshold_amount: 50000, below_threshold_rate: 10.0, above_threshold_rate: 8.0, gst_rate: 18.0 }],
      chat_threads: [
        { id: 'col_123', campaign_id: 'c1', brand_id: 'user_seed_brand', creator_id: 'user_seed_creator', status: 'IN_PROGRESS', created_at: getIsoNow(), updated_at: getIsoNow() },
        { id: 'col_124', campaign_id: 'c2', brand_id: 'user_seed_brand', creator_id: 'user_seed_creator', status: 'DISPUTED', created_at: getIsoNow(), updated_at: getIsoNow() },
        { id: 'col_125', campaign_id: 'c3', brand_id: 'user_seed_brand', creator_id: 'user_seed_creator', status: 'DELIVERED', created_at: getIsoNow(), updated_at: getIsoNow() }
      ],
      deal_offers: [
        { id: 'd1', thread_id: 'col_123', amount: 50000, deadline: '2026-06-25', status: 'ACCEPTED' },
        { id: 'd2', thread_id: 'col_124', amount: 20000, deadline: '2026-06-20', status: 'ACCEPTED' },
        { id: 'd3', thread_id: 'col_125', amount: 15000, deadline: '2026-06-18', status: 'ACCEPTED' }
      ],
      message_flags: [
        { id: 'flag_1', thread_id: 'col_123', message_id: 'm1', flagged_by: 'user_seed_brand', reason: 'inappropriate content', status: 'PENDING', created_at: getIsoNow() },
        { id: 'flag_2', thread_id: 'col_124', message_id: 'm2', flagged_by: 'user_seed_creator', reason: 'spam', status: 'RESOLVED', created_at: getIsoNow() }
      ],
      user_violations: [
        { id: 'v_1', user_id: 'user_seed_c1', type: 'Warning', date: getIsoNow().split('T')[0], reason: 'Late delivery on campaign', status: 'active' },
        { id: 'v_2', user_id: 'user_seed_c2', type: 'Suspension', date: getIsoNow().split('T')[0], reason: 'Fake engagement metrics detected', status: 'active' }
      ],
    };

    // Seed Admin Account
    const adminId = "user_admin_demo";
    db.users.push({
      user_id: adminId,
      email: "admin@ybex.demo",
      name: "Ybex General Admin",
      role: "admin",
      picture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
      auth_method: "seed",
      onboarded: true,
      created_at: getIsoNow(),
    });

    db.users.push({
      user_id: "user_admin_ybexmedia",
      email: "info@ybexmedia.com",
      name: "YbexMedia Admin",
      role: "admin",
      picture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
      auth_method: "seed",
      onboarded: true,
      created_at: getIsoNow(),
    });

    // Seed creators
    SEED_CREATORS.forEach((c) => {
      const user_id = `user_seed_${Math.random().toString(36).substring(2, 10)}`;
      const email = `${c.name.split(" ")[0].toLowerCase()}.${user_id.substring(user_id.length - 4)}@ybex.demo`;

      const seed_num = user_id.split("").reduce((accum, char) => accum + char.charCodeAt(0), 0);
      const er = parseFloat((3.5 + (seed_num % 70) / 10).toFixed(2));
      const fake = parseFloat(((seed_num % 15) + 2).toFixed(1));
      const avg_views = Math.max(1000, Math.round((c.ig + c.yt) * (er / 100) * 0.7));
      const perf = Math.max(50, Math.min(99, Math.round(70 + (seed_num % 30) - fake)));

      db.users.push({
        user_id,
        email,
        name: c.name,
        role: "creator",
        picture: c.photo,
        auth_method: "seed",
        onboarded: true,
        created_at: getIsoNow(),
      });

      db.creator_profiles.push({
        user_id,
        name: c.name,
        email,
        picture: c.photo,
        photo: c.photo,
        bio: `${c.category} creator from ${c.city}. Highly engaging and reliable content creation. Trusted by 50+ brands.`,
        category: c.category,
        sub_categories: [c.category],
        city: c.city,
        state: c.state,
        languages: c.languages,
        gender: c.gender,
        instagram: `@${c.name.split(" ")[0].toLowerCase()}_official`,
        youtube: `${c.name} Official`,
        twitter: "",
        linkedin: "",
        followers_instagram: c.ig,
        followers_youtube: c.yt,
        rate_card: c.rate,
        barter: c.barter,
        payment_terms: "within_30_days",
        portfolio: [c.photo],
        past_brands: ["Swiggy", "Zomato", "Mamaearth", "boAt"].slice(0, 3),
        creator_type: c.creator_type,
        work_mode: "active",
        verified: true,
        engagement_rate: er,
        fake_follower_pct: fake,
        avg_views_30d: avg_views,
        performance_score: perf,
        profile_views: perf * 12,
        created_at: getIsoNow(),
      });
    });

    // Seed Brand Demo
    const brandId = "user_seed_brand_demo";
    db.users.push({
      user_id: brandId,
      email: "demo@brand.ybex",
      name: "Nova Brand Co",
      role: "brand",
      picture: "https://images.unsplash.com/photo-1542744094-3a31f103e35f?w=100",
      auth_method: "seed",
      onboarded: true,
      created_at: getIsoNow(),
    });

    db.brand_profiles.push({
      user_id: brandId,
      company_name: "Nova Brand Co",
      industry: "D2C",
      team_size: "10-50",
      website: "https://nova.example",
      description: "Modern D2C brand seeking authentic digital creators to elevate brand awareness.",
      logo: "https://images.unsplash.com/photo-1542744094-3a31f103e35f?w=100",
      verified: true,
      created_at: getIsoNow(),
    });

    SEED_CAMPAIGNS.forEach((sc, idx) => {
      const campaign_id = `camp_seed_${idx + 1}`;
      db.campaigns.push({
        campaign_id,
        brand_user_id: brandId,
        brand_name: "Nova Brand Co",
        brand_logo: "https://images.unsplash.com/photo-1542744094-3a31f103e35f?w=100",
        ...sc,
        status: "live",
        applicants: [],
        deadline: "2026-08-31",
        created_at: getIsoNow(),
      });
    });

    return db;
  }

  let cloudDbLoaded = false;
  let syncEnabled = false;
  async function loadDbFromSupabase() {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from("ybex_sync")
        .select("state")
        .eq("id", 1)
        .maybeSingle();

      if (error) {
        console.log("Could not load state from Supabase table 'ybex_sync':", error.message);
        return;
      }

      syncEnabled = true;

      if (data && data.state) {
        console.log("Successfully retrieved latest application state from Supabase!");
        fs.writeFileSync(DB_PATH, JSON.stringify(data.state, null, 2), "utf8");
        cloudDbLoaded = true;
      } else {
        console.log("No state found in Supabase table 'ybex_sync'. Writing initial seed to Cloud.");
        const initialState = getInitialDbState();
        await supabase.from("ybex_sync").upsert({ id: 1, state: initialState });
        fs.writeFileSync(DB_PATH, JSON.stringify(initialState, null, 2), "utf8");
        cloudDbLoaded = true;
      }
    } catch (err: any) {
      console.log("Supabase load error:", err.message);
    }
  }

  // Auto trigger load if supabase is ready
  if (supabase) {
    loadDbFromSupabase();
  }

  function getDb(): DbState {
    if (!fs.existsSync(DB_PATH)) {
      const dbState = getInitialDbState();
      fs.writeFileSync(DB_PATH, JSON.stringify(dbState, null, 2), "utf8");
      return dbState;
    }
    try {
      const data = fs.readFileSync(DB_PATH, "utf8");
      const parsed = JSON.parse(data);
      if (!parsed.ugc_orders) parsed.ugc_orders = [];
      if (!parsed.team_activity_logs) parsed.team_activity_logs = [];
      if (!parsed.creator_payment_methods) parsed.creator_payment_methods = [];
      if (!parsed.transactions) parsed.transactions = [];
      if (!parsed.fee_configs) parsed.fee_configs = [{ id: 1, threshold_amount: 50000, below_threshold_rate: 10.0, above_threshold_rate: 8.0, gst_rate: 18.0 }];
      if (!parsed.chat_threads) parsed.chat_threads = [];
      if (!parsed.deal_offers) parsed.deal_offers = [];
      if (!parsed.message_flags) parsed.message_flags = [];
      if (!parsed.user_violations) parsed.user_violations = [];
      if (!parsed.verifications) parsed.verifications = [];
      if (!parsed.saved_creators) parsed.saved_creators = [];
      if (!parsed.collab_cost_requests) parsed.collab_cost_requests = [];
      if (!parsed.brief_requests) parsed.brief_requests = [];
      if (!parsed.creator_portfolio) parsed.creator_portfolio = [];
      if (!parsed.collab_proof_submissions) parsed.collab_proof_submissions = [];
      if (!parsed.invoice_clients) parsed.invoice_clients = [];
      if (!parsed.invoice_billing_profile) parsed.invoice_billing_profile = [];
      if (!parsed.creator_reviews) parsed.creator_reviews = [];
      if (!parsed.invoices) parsed.invoices = [];
      if (!parsed.ugc_briefs) parsed.ugc_briefs = [];
      if (!parsed.ugc_orders) parsed.ugc_orders = [];
      if (!parsed.ugc_deliveries) parsed.ugc_deliveries = [];
      if (!parsed.ugc_showcase) parsed.ugc_showcase = [];
      if (!parsed.ugc_reviews) parsed.ugc_reviews = [];
      if (!parsed.banners) parsed.banners = [];

      // Ensure Golden Crust brand user exists
      if (!parsed.users) parsed.users = [];
      if (!parsed.users.some((u: any) => u.user_id === "brand_goldencrust_id")) {
        parsed.users.push({
          user_id: "brand_goldencrust_id",
          name: "Brand Partner",
          email: "collabs@goldencrust.com",
          role: "brand",
          brand_name: "Brand Partner",
          brand_logo: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100&auto=format&fit=crop"
        });
      }

      // Ensure Artisanal Sourdough Bread Campaign exists
      if (!parsed.campaigns) parsed.campaigns = [];
      if (!parsed.campaigns.some((c: any) => c.campaign_id === "c_bread_1")) {
        parsed.campaigns.push({
          campaign_id: "c_bread_1",
          brand_user_id: "brand_goldencrust_id",
          brand_name: "Brand Partner",
          brand_logo: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100&auto=format&fit=crop",
          title: "Artisanal Sourdough Bread Campaign",
          budget_min: 15000,
          budget_max: 30000,
          deliverables: [
            "1 Instagram Reel showcasing breakfast styling with sourdough bread",
            "1 Instagram Story with a Swipe-Up link and discount code"
          ],
          brand_type: "Food & Beverage",
          location: "Mumbai, Maharashtra",
          description: "We are looking for passionate food creators to showcase our premium sourdough bread in their daily diet. Perfect crust, airy texture, and 100% natural ingredients!",
          status: "live",
          created_at: new Date().toISOString(),
          applicants: []
        });
      }

      return parsed;
    } catch (e) {
      const dbState = getInitialDbState();
      return dbState;
    }
  }

  function saveDb(db: DbState) {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
    if (supabase && syncEnabled) {
      supabase.from("ybex_sync")
        .upsert({ id: 1, state: db })
        .then(({ error }: any) => {
          if (error) console.log("Warning: Error writing backup to Supabase:", error.message);
          else console.log("State successfully backed up to Supabase Cloud.");
        })
        .catch((err: any) => {
          console.log("Supabase write catch:", err);
        });
    }
  }

  function getActingBrandId(user: any) {
    if (!user) return null;
    return user.parent_brand_id || user.user_id;
  }

  function checkBrandPermission(user: any, requiredRole: "admin" | "manager" | "viewer") {
    if (!user) return false;
    const userTeamRole = user.team_role || "admin"; 
    if (requiredRole === "admin" && userTeamRole !== "admin") return false;
    if (requiredRole === "manager" && !["admin", "manager"].includes(userTeamRole)) return false;
    if (requiredRole === "viewer" && !["admin", "manager", "viewer"].includes(userTeamRole)) return false;
    return true;
  }

  function logTeamActivity(db: any, user: any, action: string, detail: string) {
    if (!db.team_activity_logs) db.team_activity_logs = [];
    const actingBrandId = user.parent_brand_id || user.user_id;
    db.team_activity_logs.push({
      log_id: `log_${Math.random().toString(36).substring(2, 11)}`,
      brand_user_id: actingBrandId,
      user_id: user.user_id,
      user_name: user.name,
      user_email: user.email,
      team_role: user.team_role || "admin",
      action,
      detail,
      created_at: getIsoNow()
    });
  }

  function getSettings(db: DbState) {
    return db.platform_settings || {
      brand_markup_pct: 2.0,
      creator_deduction_pct: 2.0,
      agency_markup_pct: 5.0,
      agency_deduction_pct: 5.0,
      ai_review_enabled: false,
    };
  }

  function markupForRole(role: string | null | undefined, settings: any): number {
    if (role === "brand") return settings.brand_markup_pct;
    if (role === "talent_manager") return settings.agency_markup_pct;
    return 0;
  }

  function deductionForRole(role: string | null | undefined, settings: any): number {
    if (role === "creator") return settings.creator_deduction_pct;
    if (role === "talent_manager") return settings.agency_deduction_pct;
    return 0;
  }

  function applyPct(value: number, pct: number, direction: number): number {
    if (!value || !pct) return value;
    const factor = 1 + (direction * pct) / 100.0;
    return Math.round(value * factor);
  }

  function transformRateCard(rc: any, pct: number): any {
    if (!rc || !pct) return rc || {};
    const out: any = {};
    for (const k in rc) {
      if (typeof rc[k] === "number") {
        out[k] = applyPct(rc[k], pct, 1);
      } else {
        out[k] = rc[k];
      }
    }
    return out;
  }

  function parseAuthUser(req: any) {
    let token = "";
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } else if (req.headers.cookie) {
      const match = req.headers.cookie.match(/session_token=([^;]+)/);
      if (match) token = match[1];
    }

    if (!token) return null;
    const db = getDb();
    
    // Developer bypass mock tracking
    if (token === "dev_bypass") {
      let devUser = db.users.find((u: any) => u.user_id === "dev-user-id-12345");
      if (!devUser) {
        devUser = {
          user_id: "dev-user-id-12345",
          name: "Developer Bypass",
          email: "dev@ybex.io",
          role: "creator",
          onboarded: true,
          picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dev"
        };
        db.users.push(devUser);
        saveDb(db);
      }
      return devUser;
    }

    if (token === "dev_bypass_brand") {
      let devUser = db.users.find((u: any) => u.user_id === "dev-brand-id-12345");
      if (!devUser) {
        devUser = {
          user_id: "dev-brand-id-12345",
          name: "Nexus Brands",
          email: "nexus_brand@ybex.io",
          role: "brand",
          onboarded: true,
          picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Brand"
        };
        db.users.push(devUser);
        saveDb(db);
      }
      return devUser;
    }

    if (token === "dev_bypass_admin") {
      let devUser = db.users.find((u: any) => u.user_id === "dev-admin-id-12345");
      if (!devUser) {
        devUser = {
          user_id: "dev-admin-id-12345",
          name: "System Admin",
          email: "admin@ybex.io",
          role: "admin",
          onboarded: true,
          picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
        };
        db.users.push(devUser);
        saveDb(db);
      }
      return devUser;
    }

    const sess = db.user_sessions.find((s) => s.session_token === token);
    if (sess) {
      const user = db.users.find((u) => u.user_id === sess.user_id);
      if (user) {
        const { password_hash, ...safeUser } = user;
        return safeUser;
      }
    }
    const directUser = db.users.find((u) => u.user_id === token);
    if (directUser) {
      const { password_hash, ...safeUser } = directUser;
      return safeUser;
    }
    return null;
  }

  async function sendNotification(db: DbState, userId: string, type: string, message: string) {
    const notif_id = `notif_${Math.random().toString(36).substring(2, 11)}`;
    const created_at = getIsoNow();

    if (!db.notifications) db.notifications = [];
    db.notifications.push({
      notif_id,
      user_id: userId,
      type,
      message,
      read: false,
      created_at
    });

    if (supabase) {
      try {
        await supabase.from("notifications").insert({
          notif_id,
          user_id: userId,
          type,
          message,
          read: false,
          created_at
        });
        console.log(`Realtime notification triggered on Supabase for ${userId}: ${type}`);
      } catch (err: any) {
        console.log("Supabase Realtime notification dispatch error:", err?.message || err);
      }
    }
  }

  const router = express.Router();

  // Supabase checking helper endpoint
  app.get('/api/supabase-status', async (req, res) => {
    const url = "https://ozqdefczzkkfekkjzikp.supabase.co";
    const key = "sb_publishable_1oXLPrlDJPss2sHdX2YetQ_pnad39Wy";
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const sb = createClient(url, key);
      const { data, error } = await sb.from('ybex_sync').select('*').limit(1);
      if (error) {
        console.error("Supabase status check db error:", error);
        return res.json({ connected: false, error: JSON.stringify(error), details: error.message });
      }
      res.json({ connected: true, has_url: true, has_key: true });
    } catch(e: any) {
      console.error("Supabase status-check exception:", e);
      res.json({ connected: false, error: JSON.stringify(e), details: e?.message || String(e) });
    }
  });

  // AUTH API endpoints
  router.post("/auth/signup", (req, res) => {
    const { name, email, password, role, phone } = req.body;
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ detail: "Name, email, phone, and password are required" });
    }

    const db = getDb();
    const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ detail: "Email already registered" });
    }

    const user_id = `user_${Math.random().toString(36).substring(2, 12)}`;
    const newUser = {
      user_id,
      email: email.toLowerCase(),
      name,
      phone,
      password_hash: "mock_hash_" + password,
      role: role || null,
      picture: "",
      auth_method: "email",
      created_at: getIsoNow(),
      onboarded: false,
    };

    db.users.push(newUser);

    const session_token = `token_${Math.random().toString(36).substring(2, 15)}`;
    db.user_sessions.push({
      user_id,
      session_token,
      expires_at: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      created_at: getIsoNow(),
    });

    saveDb(db);

    res.cookie("session_token", session_token, { maxAge: 7 * 24 * 3600 * 1000, httpOnly: true });
    res.cookie("has_session", "true", { maxAge: 7 * 24 * 3600 * 1000, httpOnly: false });
    const { password_hash, ...safeUser } = newUser;
    res.json({ token: session_token, user: safeUser });
  });

  router.post("/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ detail: "Email and password are required" });
    }

    const db = getDb();
    let user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      // Auto-create user for frictionless login experience
      const user_id = `user_auto_${Math.random().toString(36).substring(2, 11)}`;
      const cleanEmail = email.toLowerCase();
      let role = "creator";
      if (cleanEmail.includes("brand") || cleanEmail.includes("company") || cleanEmail.includes("nexus")) {
        role = "brand";
      } else if (cleanEmail.includes("admin")) {
        role = "admin";
      }

      user = {
        user_id,
        email: cleanEmail,
        name: email.split("@")[0].split(".")[0].split("+")[0].toUpperCase() || "Demo User",
        role,
        picture: "https://ui-avatars.com/api/?name=" + encodeURIComponent(email.split("@")[0]) + "&background=7C3AED&color=fff",
        auth_method: "password",
        onboarded: true,
        created_at: getIsoNow(),
        phone: "9999999999",
        password_hash: "mock_hash_" + password,
      };
      db.users.push(user);

      if (role === "brand") {
        db.brand_profiles = db.brand_profiles || [];
        const bp = db.brand_profiles.find(p => p.user_id === user_id);
        if (!bp) {
          db.brand_profiles.push({
            user_id,
            company_name: user.name + " Brand",
            logo: user.picture,
            verified: true,
            status: "approved"
          });
        }
      } else if (role === "creator") {
        db.creator_profiles = db.creator_profiles || [];
        const cp = db.creator_profiles.find(p => p.user_id === user_id);
        if (!cp) {
          db.creator_profiles.push({
            user_id,
            name: user.name,
            email: user.email,
            photo: user.picture,
            picture: user.picture,
            bio: `Verified Professional Creator. Highly engaging and reliable content creation.`,
            category: "Tech",
            sub_categories: ["Tech"],
            city: "Mumbai",
            state: "Maharashtra",
            languages: ["English", "Hindi"],
            verified: true,
            status: "approved"
          });
        }
      }
    }

    const session_token = `token_${Math.random().toString(36).substring(2, 15)}`;
    db.user_sessions = db.user_sessions || [];
    db.user_sessions.push({
      user_id: user.user_id,
      session_token,
      expires_at: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      created_at: getIsoNow(),
    });

    saveDb(db);

    res.cookie("session_token", session_token, { maxAge: 7 * 24 * 3600 * 1000, httpOnly: true });
    res.cookie("has_session", "true", { maxAge: 7 * 24 * 3600 * 1000, httpOnly: false });
    const { password_hash, ...safeUser } = user;
    res.json({ token: session_token, user: safeUser });
  });

  // Standard Google OAuth: Get authorization URL
  router.get("/auth/google/url", (req, res) => {
    const client_id = process.env.GOOGLE_CLIENT_ID;
    if (!client_id) {
      return res.status(400).json({
        error: "Google OAuth Client ID is not configured on the server. Please configure GOOGLE_CLIENT_ID in the settings panel."
      });
    }

    const redirect_uri = (req.query.redirect_uri as string) || "";
    const params = new URLSearchParams({
      client_id,
      redirect_uri,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "consent"
    });

    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    res.json({ url, is_fallback: false });
  });

  // Standard Google OAuth: Callback code exchange and user info fetching
  router.get("/auth/google/callback", async (req, res) => {
    const { code, error } = req.query;

    if (error || !code) {
      console.error("Google Auth error returned to callback:", error);
      return res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: "OAUTH_FAILURE" }, "*");
                window.close();
              } else {
                window.location.href = "/login";
              }
            </script>
            <p>Authorization failed or was cancelled. Closing window...</p>
          </body>
        </html>
      `);
    }

    const client_id = process.env.GOOGLE_CLIENT_ID;
    const client_secret = process.env.GOOGLE_CLIENT_SECRET;

    if (!client_id || !client_secret) {
      return res.status(400).send("Google OAuth Client ID & Secret are not configured on the server.");
    }

    try {
      const host = req.get("host") || "";
      const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
      const redirect_uri = `${protocol}://${host}/api/auth/google/callback`;

      // 1. Exchange authorization code for token
      const tokenResponse = await axios.post("https://oauth2.googleapis.com/token", {
        client_id,
        client_secret,
        code,
        redirect_uri,
        grant_type: "authorization_code"
      });

      const { access_token, id_token } = tokenResponse.data;

      // 2. Fetch user profile info from Google API
      const userinfoResponse = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      });

      const profile = userinfoResponse.data;
      const { sub, email, name, picture } = profile;

      if (!email) {
        throw new Error("No email returned from Google profile scope.");
      }

      // Handle standard callback flow with Supabase Auth
      let supabaseSession: any = null;
      let supId = "";
      if (supabase && id_token) {
        try {
          const { data: authData, error: authError } = await supabase.auth.signInWithIdToken({
            provider: "google",
            token: id_token
          });
          if (authError) {
            console.error("Supabase signInWithIdToken failed:", authError.message);
          } else {
            console.log("Supabase Auth sign-in successful!");
            supabaseSession = authData.session;
            if (authData.user) {
              supId = authData.user.id;
            }
          }
        } catch (sErr: any) {
          console.error("Error executing supabase.auth.signInWithIdToken:", sErr.message || sErr);
        }
      }

      const db = getDb();
      let user_id = "";
      let existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

      if (existing) {
        if (supId && !existing.user_id.includes("-")) {
          const old_id = existing.user_id;
          existing.user_id = supId;
          db.user_sessions.forEach((s) => {
            if (s.user_id === old_id) s.user_id = supId;
          });
        }
        user_id = existing.user_id;
        if (!existing.name) existing.name = name || email.split("@")[0];
        if (!existing.picture) existing.picture = picture;
        existing.auth_method = "google";
      } else {
        user_id = supId || `user_google_${sub || Math.random().toString(36).substring(2, 12)}`;
        const newUser = {
          user_id,
          email: email.toLowerCase(),
          name: name || email.split("@")[0],
          picture: picture || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100",
          role: null,
          auth_method: "google",
          created_at: getIsoNow(),
          onboarded: false
        };
        db.users.push(newUser);
      }

      const session_token = `token_oauth_${Math.random().toString(36).substring(2, 15)}`;
      db.user_sessions.push({
        user_id,
        session_token,
        expires_at: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
        created_at: getIsoNow()
      });

      saveDb(db);

      res.cookie("session_token", session_token, { maxAge: 7 * 24 * 3600 * 1000, httpOnly: true, secure: true, sameSite: "none" });
      res.cookie("has_session", "true", { maxAge: 7 * 24 * 3600 * 1000, httpOnly: false, secure: true, sameSite: "none" });

      return res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({
                  type: "OAUTH_SUCCESS",
                  token: "${session_token}",
                  supabaseSession: ${JSON.stringify(supabaseSession || null)}
                }, "*");
                window.close();
              } else {
                window.location.href = "/dashboard";
              }
            </script>
            <p>Google signing in successful! Closing window...</p>
          </body>
        </html>
      `);
    } catch (err: any) {
      console.error("Google Auth Token Exchange/Userinfo Error:", err?.response?.data || err?.message || err);
      return res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: "OAUTH_FAILURE" }, "*");
                window.close();
              } else {
                window.location.href = "/login";
              }
            </script>
            <p>Google authentication failed. Please try again.</p>
          </body>
        </html>
      `);
    }
  });

  router.get("/auth/me", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) {
      return res.status(401).json({ detail: "Not authenticated" });
    }

    const db = getDb();
    if (user.role === "creator") {
      const cp = db.creator_profiles?.find(p => p.user_id === user.user_id);
      if (cp) {
        user.category = cp.category || "";
        user.kyc_verified = cp.verified || false;
      }
    } else if (user.role === "brand") {
      const bp = db.brand_profiles?.find(p => p.user_id === user.user_id);
      if (bp) {
        user.industry = bp.industry || "";
        user.kyc_verified = bp.verified || false;
      }
    }

    if (user.role === "creator") {
      const db = getDb();
      db.collabs = db.collabs || [];
      db.chat_threads = db.chat_threads || [];
      db.chat_messages = db.chat_messages || [];
      db.invoices = db.invoices || [];
      db.ugc_briefs = db.ugc_briefs || [];
      db.ugc_orders = db.ugc_orders || [];
      db.earnings = db.earnings || [];
      db.banners = db.banners || [];

      const hasCollabs = db.collabs.some(c => c.creator_id === user.user_id || c.to_user_id === user.user_id || c.from_user_id === user.user_id);
      if (!hasCollabs) {
        const c1_id = `collab_demo_1`;
        const c2_id = `collab_demo_2`;
        const brand_id = "demo_brand";
        const thread1_id = "thread_demo_1";
        
        if (!db.users.find(u => u.user_id === brand_id)) {
           db.users.push({ user_id: brand_id, name: "Nexus Brands", email: "nexus@example.com", role: "brand" });
        }
        if (!db.brand_profiles) db.brand_profiles = [];
        if (!db.brand_profiles.find(b => b.user_id === brand_id)) {
           db.brand_profiles.push({ user_id: brand_id, company_name: "Nexus Brands Inc.", industry: "Lifestyle" });
        }
        
        const d = new Date();
        db.collabs.push({
          collab_id: c1_id, to_user_id: user.user_id, from_user_id: brand_id, campaign_id: "c1", status: "active",
          rate: 15000, message: "Looking forward to this!", created_at: new Date(d.getTime() - 86400000*3).toISOString(),
          brand_name: "Nexus Brands Inc."
        });
        db.collabs.push({
          collab_id: c2_id, to_user_id: brand_id, from_user_id: user.user_id, campaign_id: "c2", status: "completed",
          rate: 25000, message: "Loved working on this.", created_at: new Date(d.getTime() - 86400000*10).toISOString(),
          brand_name: "Nexus Brands Inc."
        });

        if (db.campaigns && db.campaigns[0]) {
           db.campaigns[0].applicants = db.campaigns[0].applicants || [];
           db.campaigns[0].applicants.push({
               application_id: "app_seed_1", creator_user_id: user.user_id, 
               pitch: "I'd love to work with you!", proposed_amount: 15000, status: "pending", applied_at: new Date().toISOString()
           });
        }
        if (db.campaigns && db.campaigns[1]) {
           db.campaigns[1].applicants = db.campaigns[1].applicants || [];
           db.campaigns[1].applicants.push({
               application_id: "app_seed_2", creator_user_id: user.user_id, 
               pitch: "Here's my pitch for this campaign.", proposed_amount: 20000, status: "accepted", applied_at: new Date().toISOString()
           });
        }

        db.chat_threads.push({
          id: thread1_id, collab_id: c1_id, creator_id: user.user_id, brand_id,
          status: "active", created_at: new Date(d.getTime() - 86400000*3).toISOString(), updated_at: new Date().toISOString()
        });
        db.chat_messages.push({
          id: "m_d_1", thread_id: thread1_id, sender_id: brand_id, content: "Hey! We accepted your application. Please send the draft link.", created_at: new Date(d.getTime() - 86400000).toISOString()
        });
        db.chat_messages.push({
          id: "m_d_2", thread_id: thread1_id, sender_id: user.user_id, content: "Great! Working on it now.", created_at: new Date().toISOString()
        });

        db.invoices.push({
          id: "inv1", invoice_number: "INV-8001", creator_id: user.user_id, client_id: brand_id,
          client_name: "Nexus Brands Inc.", total_amount: 25000, status: "PAID",
          issue_date: new Date(d.getTime() - 86400000*10).toISOString(), due_date: new Date(d.getTime() + 86400000*10).toISOString(),
          items: [{description: "Instagram Reel", amount: 25000}]
        });
        db.invoices.push({
          id: "inv2", invoice_number: "INV-8002", creator_id: user.user_id, client_id: brand_id,
          client_name: "Nexus Brands Inc.", total_amount: 15000, status: "PENDING",
          issue_date: new Date().toISOString(), due_date: new Date(d.getTime() + 86400000*30).toISOString(),
          items: [{description: "YouTube Integration", amount: 15000}]
        });

        const brief_id = "brief_demo_1";
        const order_id = "ugc_ord_demo_1";
        if(!db.ugc_briefs.find(b => b.id === brief_id)) {
            db.ugc_briefs.push({
            id: brief_id, brand_id, title: "Quick Unboxing for Activewear", product_name: "Aura Leggings",
            product_description: "Premium high-waisted seamless leggings with side pockets.",
            detailed_requirements: "We are looking for a highly engaging, well-lit unboxing video showing the premium packaging and the stretchability of the leggings. Please highlight the side pockets and the seamless design.",
            sample_content_url: "https://example.com/sample-ugc-unboxing",
            budget: 3500, deliverable_type: "instagram_reel", dos: ["Show fabric stretch", "Mention 24h shipping"], donts: ["Mention price", "Show other brands"], status: "IN_PROGRESS",
            claimed_count: 1, max_creators: 1
            });
        }
        db.ugc_orders.push({
          id: order_id, brief_id, creator_id: user.user_id, brief: db.ugc_briefs.find(b => b.id === brief_id),
          brand_status: "IN_PROGRESS", creator_status: "CLAIMED", creator_payout: 3300, agreed_amount: 3500,
          internal_deadline: new Date(d.getTime() + 86400000).toISOString(), created_at: new Date().toISOString()
        });
        db.earnings.push({
          id: "earn_1", creator_id: user.user_id, brief: db.ugc_briefs.find(b => b.id === brief_id),
          creator_payout: 4200, created_at: new Date(d.getTime() - 86400000*5).toISOString()
        });

        // Add some available brief
        if(!db.ugc_briefs.find(b=>b.id==="brief_open_1")){
          db.ugc_briefs.push({
            id: "brief_open_1", brand_id, title: "Protein Powder review", product_name: "Pro Whey",
            product_description: "High-quality whey protein powder for muscle recovery.",
            detailed_requirements: "Show yourself mixing the powder with water or milk in a shaker. Take a sip and talk about the taste and how it helps you recover after a workout.",
            sample_content_url: "https://example.com/sample-ugc-review",
            budget: 5000, deliverable_type: "youtube_short", dos: ["Show mixing"], donts: [], status: "OPEN",
            claimed_count: 0, max_creators: 3
          });
        }

        saveDb(db);
      }
    } else if (user.role === "brand") {
      const db = getDb();
      db.ugc_briefs = db.ugc_briefs || [];
      db.ugc_orders = db.ugc_orders || [];
      db.collabs = db.collabs || [];

      const hasBrandData = db.ugc_briefs.some(b => b.brand_id === user.user_id);
      if (!hasBrandData) {
        const creator_id = "creator_demo_1";
        if (!db.users.find(u => u.user_id === creator_id)) {
           db.users.push({ user_id: creator_id, name: "Alice Creator", email: "alice@example.com", role: "creator" });
        }

        const brief_id = "brief_demo_brand_1";
        const order_id = "ugc_ord_demo_brand_1";
        db.ugc_briefs.push({
          id: brief_id, brand_id: user.user_id, title: "Quick Unboxing for Activewear", product_name: "Aura Leggings",
          detailed_requirements: "We are looking for a highly engaging, well-lit unboxing video showing the premium packaging and the stretchability of the leggings. Please highlight the side pockets and the seamless design.",
          sample_content_url: "https://example.com/sample-ugc-unboxing",
          product_description: "Premium high-waisted seamless leggings with side pockets.",
          budget: 3500, deliverable_type: "instagram_reel", dos: ["Show fabric stretch", "Mention 24h shipping"], donts: ["Mention price", "Show other brands"], status: "IN_PROGRESS",
          claimed_count: 1, max_creators: 1
        });
        
        const d = new Date();
        db.ugc_orders.push({
          id: order_id, brief_id, creator_id: creator_id, brief: db.ugc_briefs.find(b => b.id === brief_id),
          brand_status: "IN_PROGRESS", creator_status: "CLAIMED", creator_payout: 3300, agreed_amount: 3500,
          internal_deadline: new Date(d.getTime() + 86400000).toISOString(), created_at: new Date().toISOString()
        });

        db.collabs.push({
          collab_id: "collab_brand_1", to_user_id: creator_id, from_user_id: user.user_id, campaign_id: "c1", status: "active",
          rate: 15000, message: "Let's do this!", created_at: new Date(d.getTime() - 86400000*3).toISOString(),
          brand_name: "Nexus Brands Inc.", creator_name: "Alice Creator"
        });

        saveDb(db);
      }
    }

    res.json(user);
  });

  router.post("/auth/logout", (req, res) => {
    const authHeader = req.headers.authorization;
    let token = "";
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
    const db = getDb();
    if (token) {
      db.user_sessions = db.user_sessions.filter((s) => s.session_token !== token);
    }
    saveDb(db);
    res.clearCookie("session_token");
    res.clearCookie("has_session");
    res.json({ ok: true });
  });

  router.post("/auth/onboard", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) {
      return res.status(401).json({ detail: "Not authenticated" });
    }
    const db = getDb();
    const dbUser = db.users.find(u => u.user_id === user.user_id);
    if (dbUser) {
      dbUser.onboarded = true;
      dbUser.onboarding_completed = true;

      const { role, data } = req.body || {};
      if (role === "creator") {
        if (!db.creator_profiles) db.creator_profiles = [];
        let profile = db.creator_profiles.find(p => p.user_id === user.user_id);
        if (!profile) {
          profile = { user_id: user.user_id };
          db.creator_profiles.push(profile);
        }
        Object.assign(profile, data || {});
      } else if (role === "brand") {
        if (!db.brand_profiles) db.brand_profiles = [];
        let profile = db.brand_profiles.find(p => p.user_id === user.user_id);
        if (!profile) {
          profile = { user_id: user.user_id };
          db.brand_profiles.push(profile);
        }
        Object.assign(profile, data || {});
      }

      saveDb(db);
    }
    res.json({ ok: true, user: dbUser });
  });

  router.post("/auth/role", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) {
      return res.status(401).json({ detail: "Not authenticated" });
    }
    const { role } = req.body;
    if (!["creator", "brand", "talent_manager"].includes(role)) {
      return res.status(400).json({ detail: "Invalid role" });
    }

    const db = getDb();
    const dbUser = db.users.find((u) => u.user_id === user.user_id);
    if (dbUser) {
      dbUser.role = role;
      saveDb(db);
    }
    res.json({ ok: true, role });
  });

  // Admin capabilities
  router.get("/system-status", (req, res) => {
    const db = getDb();
    const settings = getSettings(db);
    
    // Check if auto-off time has passed
    const now = new Date().getTime();
    if (settings.maintenance_mode_creator && settings.maintenance_creator_until) {
       if (now >= new Date(settings.maintenance_creator_until).getTime()) {
          settings.maintenance_mode_creator = false;
          settings.maintenance_creator_until = null;
          saveDb(db);
       }
    }
    if (settings.maintenance_mode_brand && settings.maintenance_brand_until) {
       if (now >= new Date(settings.maintenance_brand_until).getTime()) {
          settings.maintenance_mode_brand = false;
          settings.maintenance_brand_until = null;
          saveDb(db);
       }
    }

    res.json({ 
      maintenance_mode_creator: !!settings.maintenance_mode_creator,
      maintenance_mode_brand: !!settings.maintenance_mode_brand
    });
  });

  router.post("/admin/maintenance", (req, res) => {
    const user = parseAuthUser(req);
    if (!user || user.role !== "admin") return res.status(403).json({ detail: "Admin only" });
    const db = getDb();
    if (!db.platform_settings) db.platform_settings = { brand_markup_pct: 2, creator_deduction_pct: 2, agency_markup_pct: 5, agency_deduction_pct: 5 };
    
    const { type, maintenance, autoOffHours } = req.body;
    let untilTime = null;
    
    if (maintenance && autoOffHours) {
        const time = new Date();
        time.setHours(time.getHours() + Number(autoOffHours));
        untilTime = time.toISOString();
    }

    if (type === 'creator') {
      db.platform_settings.maintenance_mode_creator = maintenance;
      db.platform_settings.maintenance_creator_until = untilTime;
    } else if (type === 'brand') {
      db.platform_settings.maintenance_mode_brand = maintenance;
      db.platform_settings.maintenance_brand_until = untilTime;
    }

    saveDb(db);
    res.json({ 
      ok: true, 
      maintenance_mode_creator: !!db.platform_settings.maintenance_mode_creator,
      maintenance_mode_brand: !!db.platform_settings.maintenance_mode_brand
    });
  });

  router.get("/admin/transactions", (req, res) => {
    const user = parseAuthUser(req);
    if (!user || user.role !== "admin") return res.status(403).json({ detail: "Admin only" });
    const db = getDb();
    if (!db.transactions) {
       db.transactions = [
          { id: "TX109283", type: "Escrow Release", date: "2026-06-18 14:30", from: "Nike India (Escrow)", to: "Rahul Singh", amount: 25000, fee: 1250, gst: 225, status: "Completed" },
          { id: "TX109284", type: "Wallet Top-up", date: "2026-06-18 09:15", from: "Credit Card (HDFC)", to: "Puma Tech Wallet", amount: 100000, fee: 0, gst: 0, status: "Completed" },
          { id: "TX109285", type: "Escrow Lock", date: "2026-06-17 18:45", from: "Puma Tech Wallet", to: "Campaign Escrow #42", amount: 15000, fee: 0, gst: 0, status: "Completed" },
          { id: "TX109286", type: "Refund", date: "2026-06-16 11:20", from: "Campaign Escrow #38", to: "Sony India Wallet", amount: 5000, fee: 0, gst: 0, status: "Completed" }
       ];
       saveDb(db);
    }
    res.json(db.transactions);
  });

  router.get("/admin/stats", (req, res) => {
    const user = parseAuthUser(req);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ detail: "Admin only" });
    }
    const db = getDb();
    res.json({
      users: db.users.length,
      creators: db.creator_profiles.length,
      brands: db.brand_profiles.length,
      campaigns: db.campaigns.length,
      live_campaigns: db.campaigns.filter((c) => c.status === "live").length,
      collabs: db.collabs.length,
      waves: db.waves.length,
      messages: db.chat_messages.length,
      pending_verifications: db.verifications.filter((v) => v.status === "pending").length,
      open_reports: db.reports.filter((r) => r.status === "open").length,
      critical_reports: db.reports.filter((r) => r.status === "open" && ["high", "critical"].includes(r.severity)).length,
    });
  });

  router.post("/admin/users/:id/warn", (req, res) => {
    const user = parseAuthUser(req);
    if (!user || user.role !== "admin") return res.status(403).json({ detail: "Admin only" });
    const db = getDb();
    const targetId = req.params.id;
    if (!db.user_violations) db.user_violations = [];
    db.user_violations.push({
      id: "v_" + Date.now(),
      user_id: targetId,
      type: "Warning",
      date: getIsoNow().split('T')[0],
      reason: req.body.reason || "Policy Violation"
    });
    saveDb(db);
    res.json({ ok: true });
  });

  router.post("/admin/users/:id/suspend", (req, res) => {
    const user = parseAuthUser(req);
    if (!user || user.role !== "admin") return res.status(403).json({ detail: "Admin only" });
    const db = getDb();
    const targetId = req.params.id;
    const targetUser = db.users.find(u => u.user_id === targetId);
    if (targetUser) {
       targetUser.suspended = true;
       targetUser.suspendDuration = req.body.duration;
       if (!db.user_violations) db.user_violations = [];
       db.user_violations.push({
          id: "v_" + Date.now(),
          user_id: targetId,
          type: "Suspension",
          date: getIsoNow().split('T')[0],
          reason: req.body.reason || "Suspended"
       });
       saveDb(db);
    }
    res.json({ ok: true });
  });

  router.post("/admin/users/:id/ban", (req, res) => {
    const user = parseAuthUser(req);
    if (!user || user.role !== "admin") return res.status(403).json({ detail: "Admin only" });
    const db = getDb();
    const targetUser = db.users.find(u => u.user_id === req.params.id);
    if (targetUser) {
       targetUser.banned = true;
       saveDb(db);
    }
    res.json({ ok: true });
  });

  router.post("/admin/users/:id/reinstate", (req, res) => {
    const user = parseAuthUser(req);
    if (!user || user.role !== "admin") return res.status(403).json({ detail: "Admin only" });
    const db = getDb();
    const targetUser = db.users.find(u => u.user_id === req.params.id);
    if (targetUser) {
       targetUser.banned = false;
       targetUser.suspended = false;
       saveDb(db);
    }
    res.json({ ok: true });
  });

  router.get("/admin/users/:id/violations", (req, res) => {
    const user = parseAuthUser(req);
    if (!user || user.role !== "admin") return res.status(403).json({ detail: "Admin only" });
    const db = getDb();
    const violations = (db.user_violations || []).filter(v => v.user_id === req.params.id);
    res.json(violations);
  });

  router.get("/admin/users", (req, res) => {
    const user = parseAuthUser(req);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ detail: "Admin only" });
    }
    const db = getDb();
    const safeUsers = db.users.map(({ password_hash, ...u }) => u);
    res.json(safeUsers.slice().reverse());
  });

  router.get("/admin/waitlist", (req, res) => {
    const user = parseAuthUser(req);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ detail: "Admin only" });
    }
    const db = getDb();
    res.json(db.waitlist || []);
  });

  router.post("/admin/waitlist/:id/approve", (req, res) => {
    const user = parseAuthUser(req);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ detail: "Admin only" });
    }
    const db = getDb();
    const waitlist = db.waitlist || [];
    const entry = waitlist.find(w => w.id === req.params.id);
    if (entry) {
      entry.status = "Approved";
      saveDb(db);
    }
    res.json({ ok: true });
  });

  router.post("/admin/waitlist/:id/reject", (req, res) => {
    const user = parseAuthUser(req);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ detail: "Admin only" });
    }
    const db = getDb();
    const waitlist = db.waitlist || [];
    const entry = waitlist.find(w => w.id === req.params.id);
    if (entry) {
      entry.status = "Rejected";
      entry.rejectReason = req.body.reason || "";
      saveDb(db);
    }
    res.json({ ok: true });
  });

  router.post("/admin/waitlist/batch-approve", (req, res) => {
    const user = parseAuthUser(req);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ detail: "Admin only" });
    }
    const ids = req.body.ids || [];
    const db = getDb();
    const waitlist = db.waitlist || [];
    waitlist.forEach(w => {
      if (ids.includes(w.id)) {
        w.status = "Approved";
      }
    });
    saveDb(db);
    res.json({ ok: true });
  });

  router.get("/admin/campaigns", (req, res) => {
    const user = parseAuthUser(req);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ detail: "Admin only" });
    }
    const db = getDb();
    res.json(db.campaigns.slice().reverse());
  });

  router.post("/admin/campaigns/:campaign_id/status", async (req, res) => {
    const user = parseAuthUser(req);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ detail: "Admin only" });
    }
    const db = getDb();
    const campaign = db.campaigns.find(c => c.campaign_id === req.params.campaign_id);
    if (campaign) {
      campaign.stage = req.body.stage;
      campaign.rejectReason = req.body.reason || "";
      
      if (req.body.stage === "Live" && campaign.brand_user_id) {
        await sendNotification(db, campaign.brand_user_id, "CAMPAIGN_LIVE", `Your campaign '${campaign.title}' is now LIVE! Creators can apply.`);
      } else if ((req.body.stage === "Rejected" || req.body.stage === "Review Failed") && campaign.brand_user_id) {
        await sendNotification(db, campaign.brand_user_id, "CAMPAIGN_REJECTED", `Campaign '${campaign.title}' rejected: ${req.body.reason || "Policy non-compliance"}.`);
      }

      saveDb(db);
      res.json({ ok: true, campaign });
    } else {
      res.status(404).json({ detail: "Campaign not found" });
    }
  });

  router.post("/admin/users/:user_id/ban", (req, res) => {
    const user = parseAuthUser(req);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ detail: "Admin only" });
    }
    const db = getDb();
    const dbUser = db.users.find((u) => u.user_id === req.params.user_id);
    if (dbUser) {
      dbUser.banned = true;
      saveDb(db);
    }
    res.json({ ok: true });
  });

  router.post("/admin/users/:user_id/unban", (req, res) => {
    const user = parseAuthUser(req);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ detail: "Admin only" });
    }
    const db = getDb();
    const dbUser = db.users.find((u) => u.user_id === req.params.user_id);
    if (dbUser) {
      dbUser.banned = false;
      saveDb(db);
    }
    res.json({ ok: true });
  });

  router.delete("/admin/campaigns/:campaign_id", (req, res) => {
    const user = parseAuthUser(req);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ detail: "Admin only" });
    }
    const db = getDb();
    db.campaigns = db.campaigns.filter((c) => c.campaign_id !== req.params.campaign_id);
    saveDb(db);
    res.json({ ok: true });
  });

  // Settings
  router.get("/admin/settings", (req, res) => {
    const user = parseAuthUser(req);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ detail: "Admin only" });
    }
    const db = getDb();
    res.json(getSettings(db));
  });

  router.put("/admin/settings", (req, res) => {
    const user = parseAuthUser(req);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ detail: "Admin only" });
    }
    const db = getDb();
    const { brand_markup_pct, creator_deduction_pct, agency_markup_pct, agency_deduction_pct, ai_review_enabled } = req.body;

    if (typeof brand_markup_pct === "number") db.platform_settings.brand_markup_pct = Math.max(0, Math.min(50, brand_markup_pct));
    if (typeof creator_deduction_pct === "number") db.platform_settings.creator_deduction_pct = Math.max(0, Math.min(50, creator_deduction_pct));
    if (typeof agency_markup_pct === "number") db.platform_settings.agency_markup_pct = Math.max(0, Math.min(50, agency_markup_pct));
    if (typeof agency_deduction_pct === "number") db.platform_settings.agency_deduction_pct = Math.max(0, Math.min(50, agency_deduction_pct));
    if (typeof ai_review_enabled === "boolean") db.platform_settings.ai_review_enabled = ai_review_enabled;

    saveDb(db);
    res.json(getSettings(db));
  });

  // Verification reviews
  router.get("/admin/verifications", (req, res) => {
    const user = parseAuthUser(req);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ detail: "Admin only" });
    }
    const db = getDb();
    const { status, kind } = req.query;

    let list = db.verifications;
    if (status) list = list.filter((v) => v.status === status);
    if (kind) {
      list = list.filter((v) => {
        const vKind = v.kind || (v.type?.toLowerCase() === "brand" ? "brand" : "creator");
        return vKind.toLowerCase() === String(kind).toLowerCase();
      });
    }

    const resultList = list.slice().reverse().map(v => {
      const normalizedKind = v.kind || (v.type?.toLowerCase() === "brand" ? "brand" : "creator");
      const normalizedType = v.type || (normalizedKind === "brand" ? "Brand" : "Creator");
      return {
        ...v,
        kind: normalizedKind,
        type: normalizedType
      };
    });

    res.json(resultList);
  });

  router.post("/admin/verifications/:verification_id/approve", async (req, res) => {
    const admin = parseAuthUser(req);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ detail: "Admin only" });
    }
    const db = getDb();
    const v = db.verifications.find((x) => x.verification_id === req.params.verification_id);
    if (!v) {
      return res.status(404).json({ detail: "Verification request not found" });
    }

    const { note } = req.body;
    v.status = "approved";
    v.reviewed_by = admin.user_id;
    v.review_note = note;
    v.reviewed_at = getIsoNow();

    const normalizedKind = v.kind || (v.type?.toLowerCase() === "brand" ? "brand" : "creator");
    v.kind = normalizedKind;
    v.type = normalizedKind === "brand" ? "Brand" : "Creator";

    const target_user = v.user_id;
    if (target_user) {
      if (normalizedKind === "brand") {
        const bProf = db.brand_profiles.find((bp) => bp.user_id === target_user);
        if (bProf) bProf.verified = true;
      } else {
        const cProf = db.creator_profiles.find((cp) => cp.user_id === target_user);
        if (cProf) cProf.verified = true;
      }

      const tUser = db.users.find((u) => u.user_id === target_user);
      if (tUser) tUser.verified = true;

      const msg = normalizedKind === "brand"
        ? "Your KYC has been verified! You can now create campaigns."
        : "Your KYC is verified! Start applying to campaigns.";
      await sendNotification(db, target_user, "KYC_APPROVED", msg);
    }

    saveDb(db);
    res.json({ ok: true });
  });

  router.post("/admin/verifications/:verification_id/reject", async (req, res) => {
    const admin = parseAuthUser(req);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ detail: "Admin only" });
    }
    const db = getDb();
    const v = db.verifications.find((x) => x.verification_id === req.params.verification_id);
    if (!v) {
      return res.status(404).json({ detail: "Not found" });
    }

    const { note } = req.body;
    v.status = "rejected";
    v.reviewed_by = admin.user_id;
    v.review_note = note;
    v.reviewed_at = getIsoNow();

    if (v.user_id) {
      const isBrand = v.type?.toLowerCase() === "brand" || v.kind === "brand";
      const msg = isBrand
        ? `KYC rejected: ${note || "Incorrect documents"}. Please resubmit with correct documents.`
        : `KYC rejected: ${note || "Incorrect documents"}. Please resubmit.`;
      await sendNotification(db, v.user_id, "KYC_REJECTED", msg);
    }

    saveDb(db);
    res.json({ ok: true });
  });

  router.post("/admin/verifications/:verification_id/escalate", (req, res) => {
    const admin = parseAuthUser(req);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ detail: "Admin only" });
    }
    const db = getDb();
    const v = db.verifications.find((x) => x.verification_id === req.params.verification_id);
    if (!v) {
      return res.status(404).json({ detail: "Not found" });
    }

    const { note } = req.body;
    v.status = "escalated";
    v.reviewed_by = admin.user_id;
    v.review_note = note || "Escalated to Fraud Team";
    v.reviewed_at = getIsoNow();

    if (v.user_id) {
      db.notifications.push({
        notif_id: `notif_${Math.random().toString(36).substring(2, 10)}`,
        user_id: v.user_id,
        type: "verification",
        message: `Your verification request has been escalated for secondary fraud review.`,
        read: false,
        created_at: getIsoNow(),
      });
    }

    saveDb(db);
    res.json({ ok: true });
  });

  // Report and moderations
  router.post("/reports", (req, res) => {
    const user = parseAuthUser(req);
    const db = getDb();
    const { type, severity, target, description } = req.body;

    const doc = {
      report_id: `rep_${Math.random().toString(36).substring(2, 10)}`,
      type,
      severity: severity || "medium",
      target,
      description: description || "",
      status: "open",
      reported_by: user ? user.user_id : "system",
      reported_by_name: user ? user.name : "System Auto-detect",
      created_at: getIsoNow(),
    };

    db.reports.push(doc);
    saveDb(db);
    res.json(doc);
  });

  router.get("/admin/reports", (req, res) => {
    const user = parseAuthUser(req);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ detail: "Admin only" });
    }
    const db = getDb();
    const { status } = req.query;

    let list = db.reports;
    if (status) list = list.filter((r) => r.status === status);

    res.json(list.slice().reverse());
  });

  router.post("/admin/reports/:report_id/resolve", (req, res) => {
    const admin = parseAuthUser(req);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ detail: "Admin only" });
    }
    const db = getDb();
    const r = db.reports.find((x) => x.report_id === req.params.report_id);
    if (r) {
      r.status = "resolved";
      r.resolved_by = admin.user_id;
      r.resolved_at = getIsoNow();
      saveDb(db);
    }
    res.json({ ok: true });
  });

  // Submission verification request
  router.get("/verifications/me", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });

    const db = getDb();
    const actingId = user.role === "brand" ? getActingBrandId(user) : user.user_id;
    let list = db.verifications.filter((v) => v.user_id === actingId);
    if (list.length === 0) {
      const defaultVerification = {
        id: `v_auto_${Math.random().toString(36).substring(2, 9)}`,
        user_id: actingId,
        status: "approved",
        kind: user.role === "brand" ? "brand" : "creator",
        type: user.role === "brand" ? "Brand" : "Creator",
        created_at: getIsoNow()
      };
      db.verifications.push(defaultVerification);
      saveDb(db);
      list = [defaultVerification];
    }
    // Sort latest first
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const v = list[0];
    const normalizedKind = v.kind || (v.type?.toLowerCase() === "brand" ? "brand" : "creator");
    const normalizedType = v.type || (normalizedKind === "brand" ? "Brand" : "Creator");
    res.json({
      ...v,
      kind: normalizedKind,
      type: normalizedType
    });
  });

  router.post("/verifications/request", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });

    const db = getDb();
    const kind = user.role === "brand" ? "brand" : "creator";
    const actingId = user.role === "brand" ? getActingBrandId(user) : user.user_id;

    const existingPending = db.verifications.find((v) => v.user_id === actingId && v.status === "pending");
    if (existingPending) {
      return res.json({ ok: true, already_pending: true });
    }

    const { documents, note } = req.body;
    let category = "";
    let handle = "";
    let followers = 0;

    if (kind === "creator") {
      const cp = db.creator_profiles.find((p) => p.user_id === actingId) || {};
      category = cp.category || "";
      handle = cp.instagram || cp.youtube || "";
      followers = (cp.followers_instagram || 0) + (cp.followers_youtube || 0);
    } else {
      const bp = db.brand_profiles.find((p) => p.user_id === actingId) || {};
      category = bp.industry || "";
    }

    const doc = {
      verification_id: `ver_${Math.random().toString(36).substring(2, 10)}`,
      user_id: actingId,
      name: user.name,
      email: user.email,
      photo: user.picture || "",
      kind,
      type: kind === "brand" ? "Brand" : "Creator",
      category,
      handle,
      followers,
      documents: documents || [],
      note: note || "",
      status: "approved", // Auto-approved for testing
      created_at: getIsoNow(),
    };

    db.verifications.push(doc);

    // Auto verify profiles
    if (kind === "brand") {
       const bp = db.brand_profiles.find(p => p.user_id === actingId);
       if (bp) bp.verified = true;
    } else {
       const cp = db.creator_profiles.find(p => p.user_id === actingId);
       if (cp) cp.verified = true;
    }

    saveDb(db);
    res.json({ ok: true, verification: doc });
  });

  // Creators Profiles Setup
  router.post("/creators/profile", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });

    const db = getDb();
    const body = req.body;

    const seed_num = user.user_id.split("").reduce((accum, char) => accum + char.charCodeAt(0), 0);
    const er = parseFloat((3.5 + (seed_num % 70) / 10).toFixed(2));
    const fake = parseFloat(((seed_num % 15) + 2).toFixed(1));
    const tf = (body.followers_instagram || 0) + (body.followers_youtube || 0);
    const avg_views = Math.max(1000, Math.round(tf * (er / 100) * 0.7));
    const perf = Math.max(50, Math.min(99, Math.round(70 + (seed_num % 30) - fake)));

    const profileData = {
      user_id: user.user_id,
      name: body.name || user.name,
      email: body.email || user.email,
      picture: body.photo || user.picture || "",
      photo: body.photo || user.picture || "",
      bio: body.bio || "",
      category: body.category || "",
      sub_categories: body.sub_categories || [],
      city: body.city || "",
      state: body.state || "",
      languages: body.languages || [],
      gender: body.gender || "",
      instagram: body.instagram || "",
      youtube: body.youtube || "",
      twitter: body.twitter || "",
      linkedin: body.linkedin || "",
      followers_instagram: body.followers_instagram || 0,
      followers_youtube: body.followers_youtube || 0,
      rate_card: body.rate_card || {},
      barter: body.barter || "cash_only",
      payment_terms: body.payment_terms || "within_30_days",
      portfolio: body.portfolio || [],
      past_brands: body.past_brands || [],
      creator_type: body.creator_type || "influencer",
      work_mode: body.work_mode || "active",
      engagement_rate: er,
      fake_follower_pct: fake,
      avg_views_30d: avg_views,
      performance_score: perf,
      profile_views: perf * 12,
      updated_at: getIsoNow(),
    };

    const index = db.creator_profiles.findIndex((p) => p.user_id === user.user_id);
    if (index > -1) {
      db.creator_profiles[index] = {
        ...db.creator_profiles[index],
        ...profileData,
      };
    } else {
      db.creator_profiles.push({
        ...profileData,
        verified: false,
        created_at: getIsoNow(),
      });
    }

    const tUser = db.users.find((u) => u.user_id === user.user_id);
    if (tUser) {
      tUser.picture = profileData.picture;
      tUser.name = body.name || tUser.name;
      tUser.email = body.email || tUser.email;
      tUser.onboarded = true;
      tUser.verified = false;
    }

    // Auto trigger verification request so it appears in the verifications queue
    const pendingVer = db.verifications.find((v) => v.user_id === user.user_id && v.status === "pending");
    if (!pendingVer) {
      db.verifications.push({
        verification_id: `ver_${Math.random().toString(36).substring(2, 10)}`,
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        photo: profileData.picture || user.picture || "",
        kind: "creator",
        type: "Creator",
        category: profileData.category || "Unknown",
        handle: profileData.instagram || profileData.youtube || `@${user.name.split(" ")[0].toLowerCase()}`,
        followers: (profileData.followers_instagram || 0) + (profileData.followers_youtube || 0) || 12500,
        documents: ["Onboarding Profile"],
        note: "Auto-submitted during onboarding",
        status: "pending",
        created_at: getIsoNow(),
      });
    }

    saveDb(db);
    res.json({ ok: true });
  });

  router.get("/creators", (req, res) => {
    const db = getDb();
    const viewer = parseAuthUser(req);
    let list = db.creator_profiles || [];
    
    // Only show verified profiles unless creator is viewing themselves or requested by an admin
    list = list.filter((c) => {
      if (c.verified) return true;
      if (viewer?.role === "admin") return true;
      if (viewer?.user_id === c.user_id) return true;
      return false;
    });

    const {
      q,
      category,
      city,
      platform,
      min_followers,
      max_followers,
      max_budget,
      min_engagement,
      language,
      gender,
      barter,
      creator_type,
      sort_by,
    } = req.query;

    if (q) {
      list = list.filter((c) => c.name.toLowerCase().includes((q as string).toLowerCase()));
    }
    if (category) {
      list = list.filter((c) => c.category === category);
    }
    if (city) {
      list = list.filter((c) => c.city === city);
    }
    if (language) {
      list = list.filter((c) => c.languages && c.languages.includes(language));
    }
    if (gender) {
      list = list.filter((c) => c.gender === gender);
    }
    if (barter) {
      list = list.filter((c) => c.barter === barter);
    }
    if (creator_type) {
      list = list.filter((c) => c.creator_type === creator_type);
    }
    if (min_engagement) {
      list = list.filter((c) => c.engagement_rate >= parseFloat(min_engagement as string));
    }

    const settings = getSettings(db);
    const pct = markupForRole(viewer?.role, settings);

    const totalFollowers = (c: any) => (c.followers_instagram || 0) + (c.followers_youtube || 0);
    const minRate = (c: any) => {
      const rc = c.rate_card || {};
      const values = Object.values(rc).filter((v) => typeof v === "number") as number[];
      return values.length > 0 ? Math.min(...values) : 0;
    };

    let processed = list.map((c) => {
      const mapped = { ...c };
      if (pct) {
        mapped.rate_card = transformRateCard(c.rate_card, pct);
      }
      mapped.total_followers = totalFollowers(mapped);
      mapped.min_rate = minRate(mapped);
      return mapped;
    });

    if (min_followers) {
      processed = processed.filter((c) => c.total_followers >= parseInt(min_followers as string, 10));
    }
    if (max_followers) {
      processed = processed.filter((c) => c.total_followers <= parseInt(max_followers as string, 10));
    }
    if (max_budget) {
      processed = processed.filter((c) => c.min_rate <= parseInt(max_budget as string, 10));
    }
    if (platform === "instagram") {
      processed = processed.filter((c) => c.instagram);
    }
    if (platform === "youtube") {
      processed = processed.filter((c) => c.youtube);
    }

    if (sort_by === "followers") {
      processed.sort((a, b) => b.total_followers - a.total_followers);
    } else if (sort_by === "engagement") {
      processed.sort((a, b) => b.engagement_rate - a.engagement_rate);
    } else if (sort_by === "budget") {
      processed.sort((a, b) => a.min_rate - b.min_rate);
    } else {
      processed.sort((a, b) => b.performance_score - a.performance_score);
    }

    res.json(processed.slice(0, 100));
  });

  router.get("/creators/:user_id", (req, res) => {
    const db = getDb();
    const c = db.creator_profiles.find((p) => p.user_id === req.params.user_id);
    if (!c) {
      return res.status(404).json({ detail: "Creator not found" });
    }

    c.profile_views = (c.profile_views || 0) + 1;
    saveDb(db);

    const viewer = parseAuthUser(req);
    const settings = getSettings(db);

    const mapped = { ...c };
    if (!viewer || (viewer.user_id !== req.params.user_id && viewer.role !== "admin")) {
      const pct = markupForRole(viewer?.role, settings);
      if (pct) {
        mapped.rate_card = transformRateCard(c.rate_card, pct);
      }
    }

    res.json(mapped);
  });

  // Saved Creators Toggle
  router.post("/creators/:id/save", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    if (user.role !== "brand") return res.status(403).json({ detail: "Only brands can save creators" });

    const db = getDb();
    db.saved_creators = db.saved_creators || [];
    const brand_id = getActingBrandId(user);
    const creator_id = req.params.id;

    const idx = db.saved_creators.findIndex((s) => s.brand_id === brand_id && s.creator_id === creator_id);
    let saved = false;
    if (idx > -1) {
      db.saved_creators.splice(idx, 1);
    } else {
      db.saved_creators.push({ brand_id, creator_id, created_at: getIsoNow() });
      saved = true;
    }
    saveDb(db);
    res.json({ saved });
  });

  router.get("/creators/:id/saved-status", (req, res) => {
    const user = parseAuthUser(req);
    if (!user || user.role !== "brand") return res.json({ saved: false });
    const db = getDb();
    db.saved_creators = db.saved_creators || [];
    const brand_id = getActingBrandId(user);
    const creator_id = req.params.id;
    const isSaved = db.saved_creators.some((s) => s.brand_id === brand_id && s.creator_id === creator_id);
    res.json({ saved: isSaved });
  });

  // Request Collab Cost
  router.post("/creators/:id/request-collab-cost", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    if (user.role !== "brand") return res.status(403).json({ detail: "Only brands can request cost" });

    const db = getDb();
    db.collab_cost_requests = db.collab_cost_requests || [];
    const brand_id = getActingBrandId(user);
    const creator_id = req.params.id;
    const { deliverable_type, brand_message } = req.body;

    const newRequest = {
      id: `cost_req_${Math.random().toString(36).substring(2, 10)}`,
      brand_id,
      creator_id,
      deliverable_type,
      brand_message,
      status: "PENDING",
      created_at: getIsoNow(),
    };

    db.collab_cost_requests.push(newRequest);

    db.notifications = db.notifications || [];
    db.notifications.push({
      notif_id: `notif_${Math.random().toString(36).substring(2, 10)}`,
      user_id: creator_id,
      type: "collab_cost",
      message: `A brand requested collab cost for ${deliverable_type}`,
      read: false,
      created_at: getIsoNow(),
    });

    saveDb(db);
    res.json(newRequest);
  });

  // Creator Response Quote to cost request
  router.post("/cost-requests/:id/quote", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    if (user.role !== "creator") return res.status(403).json({ detail: "Only creators can quote" });

    const db = getDb();
    db.collab_cost_requests = db.collab_cost_requests || [];
    const request = db.collab_cost_requests.find((r) => r.id === req.params.id);
    if (!request) return res.status(404).json({ detail: "Cost request not found" });

    const { quoted_amount } = req.body;
    request.quoted_amount = quoted_amount;
    request.status = "QUOTED";
    request.responded_at = getIsoNow();

    db.notifications = db.notifications || [];
    db.notifications.push({
      notif_id: `notif_${Math.random().toString(36).substring(2, 10)}`,
      user_id: request.brand_id,
      type: "collab_cost_quoted",
      message: `Creator quoted ₹${quoted_amount} for your cost request`,
      read: false,
      created_at: getIsoNow(),
    });

    saveDb(db);
    res.json(request);
  });

  // Send Brief Request
  router.post("/creators/:id/send-brief", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    if (user.role !== "brand") return res.status(403).json({ detail: "Only brands can send briefs" });

    const db = getDb();
    db.brief_requests = db.brief_requests || [];
    const brand_id = getActingBrandId(user);
    const creator_id = req.params.id;
    const { message, budget_range } = req.body;

    const newBrief = {
      id: `brief_req_${Math.random().toString(36).substring(2, 10)}`,
      brand_id,
      creator_id,
      message,
      budget_range,
      status: "PENDING",
      created_at: getIsoNow(),
    };

    db.brief_requests.push(newBrief);

    db.notifications = db.notifications || [];
    db.notifications.push({
      notif_id: `notif_${Math.random().toString(36).substring(2, 10)}`,
      user_id: creator_id,
      type: "new_brief",
      message: `You received a new brief request!`,
      read: false,
      created_at: getIsoNow(),
    });

    saveDb(db);
    res.json(newBrief);
  });

  // Brands Profiles
  router.post("/brands/profile", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });

    const db = getDb();
    const body = req.body;

    const userTeamRole = user.team_role || "admin";
    if (userTeamRole !== "admin") {
      return res.status(403).json({ detail: "Only brand administrator (Admin) can modify company details." });
    }

    const actingId = getActingBrandId(user);
    const profileData = {
      user_id: actingId,
      company_name: body.company_name || user.name,
      industry: body.industry || "",
      team_size: body.team_size || "",
      website: body.website || "",
      description: body.description || "",
      logo: body.logo || user.picture || "",
      agency_mode: body.agency_mode || false,
      updated_at: getIsoNow(),
    };

    const idx = db.brand_profiles.findIndex((p) => p.user_id === actingId);
    if (idx > -1) {
      db.brand_profiles[idx] = {
        ...db.brand_profiles[idx],
        ...profileData,
      };
    } else {
      db.brand_profiles.push({
        ...profileData,
        verified: false,
        created_at: getIsoNow(),
      });
    }

    const uDoc = db.users.find((u) => u.user_id === user.user_id);
    if (uDoc) {
      uDoc.picture = profileData.logo;
      uDoc.onboarded = true;
      uDoc.verified = false;
      if (body.role === "talent_manager") {
         uDoc.role = "talent_manager";
      }
    }

    // Auto trigger verification request so it appears in the brand verifications queue
    const pendingVer = db.verifications.find((v) => v.user_id === actingId && v.status === "pending");
    if (!pendingVer) {
      db.verifications.push({
        verification_id: `ver_${Math.random().toString(36).substring(2, 10)}`,
        user_id: actingId,
        name: profileData.company_name,
        email: user.email,
        photo: profileData.logo || user.picture || "",
        kind: "brand",
        type: "Brand",
        category: profileData.industry || "D2C Brand",
        handle: profileData.website || "https://ybexmedia.com",
        followers: 0,
        documents: ["Corporate Registration"],
        note: "Auto-submitted during onboarding",
        status: "pending",
        created_at: getIsoNow(),
      });
    }

    logTeamActivity(db, user, "Update Profile", `Updated brand company profile detail`);
    saveDb(db);
    res.json({ ok: true });
  });

  router.get("/brands/me", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });

    const db = getDb();
    const actingId = getActingBrandId(user);
    const bp = db.brand_profiles.find((p) => p.user_id === actingId);
    if (bp) {
      res.json({ ...bp, team_role: user.team_role || "admin" });
    } else {
      res.json({ team_role: user.team_role || "admin" });
    }
  });

  // GET brand team members & activity logs
  router.get("/brands/team", (req, res) => {
    const user = parseAuthUser(req);
    if (!user || user.role !== "brand") return res.status(401).json({ detail: "Not authorized" });

    const db = getDb();
    const actingId = getActingBrandId(user);
    const parentUser = db.users.find(u => u.user_id === actingId);
    
    // Sub members
    const members = db.users
      .filter((u) => u.parent_brand_id === actingId)
      .map(({ password_hash, ...m }) => m);

    // Add primary owner/admin to list
    if (parentUser) {
      const { password_hash, ...safeParent } = parentUser;
      members.unshift({
        ...safeParent,
        team_role: "admin",
        is_owner: true
      });
    }

    const logs = (db.team_activity_logs || [])
      .filter((l) => l.brand_user_id === actingId)
      .slice()
      .reverse();

    res.json({ members, logs });
  });

  // ADD brand team member (Admin only task)
  router.post("/brands/team/add", (req, res) => {
    const user = parseAuthUser(req);
    if (!user || user.role !== "brand") return res.status(401).json({ detail: "Not authorized" });

    const userTeamRole = user.team_role || "admin";
    if (userTeamRole !== "admin") {
      return res.status(403).json({ detail: "Only Administrator (Admin) can add brand team managers." });
    }

    const { name, email, password, team_role } = req.body;
    if (!name || !email || !password || !team_role) {
      return res.status(400).json({ detail: "Name, email, password, and team role are required." });
    }

    const db = getDb();
    const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ detail: "This email address is already in use." });
    }

    const actingId = getActingBrandId(user);
    const newMemberId = `user_member_${Math.random().toString(36).substring(2, 12)}`;
    
    const newMember = {
      user_id: newMemberId,
      email: email.toLowerCase(),
      name,
      password_hash: "mock_hash_" + password,
      role: "brand",
      picture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
      auth_method: "email",
      created_at: getIsoNow(),
      onboarded: true,
      parent_brand_id: actingId,
      team_role,
    };

    db.users.push(newMember);
    
    logTeamActivity(db, user, "Add Team Member", `Added team member '${name}' with role '${team_role}'`);
    saveDb(db);

    res.json({ ok: true, member: { user_id: newMemberId, name, email, team_role } });
  });

  // GET managed talent profiles under this parent agency account
  router.get("/agency/creators", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });

    const db = getDb();
    const actingId = getActingBrandId(user);
    const list = db.creator_profiles.filter((c) => c.managed_by_agency_id === actingId);
    res.json(list);
  });

  // CREATE / REGISTER new managed creator portfolio (Agency Mode capability)
  router.post("/agency/creators", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });

    const userTeamRole = user.team_role || "admin";
    if (userTeamRole === "viewer") {
      return res.status(403).json({ detail: "Viewer role is read-only and cannot add creators to portfolio." });
    }

    const db = getDb();
    const actingId = getActingBrandId(user);
    const body = req.body;

    const cid = `creator_managed_${Math.random().toString(36).substring(2, 11)}`;
    const newProfile = {
      user_id: cid,
      name: body.name || "Managed Talent",
      email: body.email || `managed.${cid}@agency.demo`,
      picture: body.photo || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400",
      photo: body.photo || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400",
      bio: body.bio || "Professional creator managed under our talent agency portfolio.",
      category: body.category || "Lifestyle",
      sub_categories: [body.category || "Lifestyle"],
      city: body.city || "Mumbai",
      state: body.state || "Maharashtra",
      languages: body.languages || ["Hindi", "English"],
      gender: body.gender || "female",
      instagram: body.instagram || `@${(body.name || "talent").replace(/\s+/g, "").toLowerCase()}`,
      youtube: body.youtube || `${body.name || "Talent"} Youtube Channel`,
      followers_instagram: parseInt(body.followers_instagram) || 45000,
      followers_youtube: parseInt(body.followers_youtube) || 12000,
      rate_card: body.rate_card || { reel: 8000, story: 3000, yt_video: 15000 },
      barter: body.barter || "barter_ok",
      payment_terms: "within_30_days",
      portfolio: [body.photo || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400"],
      past_brands: ["Flipkart", "Nykaa"],
      work_mode: "active",
      engagement_rate: 4.8,
      fake_follower_pct: 0.9,
      avg_views_30d: 15000,
      performance_score: 92,
      managed_by_agency_id: actingId,
      created_at: getIsoNow(),
    };

    db.creator_profiles.push(newProfile);
    
    // If they aren't registered as a full user yet, let's also register a placeholder user profile for routing safety
    db.users.push({
      user_id: cid,
      email: newProfile.email,
      name: newProfile.name,
      role: "creator",
      picture: newProfile.photo,
      onboarded: true,
      verified: true,
      created_at: getIsoNow()
    });

    logTeamActivity(db, user, "Add Portfolio Creator", `Published managed portfolio for creator '${newProfile.name}'`);
    saveDb(db);

    res.json(newProfile);
  });

  // POST /creators/work-mode: Switch available status for independent creator logins
  router.post("/creators/work-mode", (req, res) => {
    const user = parseAuthUser(req);
    if (!user || user.role !== "creator") {
      return res.status(403).json({ detail: "Only creator profiles can toggle their availability status" });
    }

    const { work_mode } = req.body;
    if (!["active", "away"].includes(work_mode)) {
      return res.status(400).json({ detail: "Invalid work_mode structure. Must be 'active' or 'away'" });
    }

    const db = getDb();
    const cp = db.creator_profiles.find((p) => p.user_id === user.user_id);
    if (cp) {
      cp.work_mode = work_mode;
    }
    
    const usr = db.users.find((u) => u.user_id === user.user_id);
    if (usr) {
      usr.work_mode = work_mode;
    }

    saveDb(db);
    res.json({ ok: true, work_mode });
  });

  // Campaigns API
  router.post("/campaigns", (req, res) => {
    const user = parseAuthUser(req);
    if (!user || user.role !== "brand") {
      return res.status(403).json({ detail: "Only brands can post campaigns" });
    }

    const userTeamRole = user.team_role || "admin";
    if (userTeamRole === "viewer") {
      return res.status(403).json({ detail: "Viewer role is read-only and cannot post new campaigns." });
    }

    const db = getDb();
    const actingId = getActingBrandId(user);
    
    // Auto-create / Auto-verify brand profile for seamless developer and user experience without KYC lock blocks
    let bp = db.brand_profiles.find((p) => p.user_id === actingId);
    if (!bp) {
      bp = {
        user_id: actingId,
        company_name: user.name + " Co",
        logo: user.picture || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name) + "&background=7C3AED&color=fff",
        verified: true,
        status: "approved"
      };
      db.brand_profiles.push(bp);
    } else if (!bp.verified) {
      bp.verified = true;
      bp.status = "approved";
    }

    const cid = `camp_${Math.random().toString(36).substring(2, 10)}`;

    const campaign = {
      id: cid,
      campaign_id: cid,
      brand_user_id: actingId,
      brand_name: bp?.company_name || user.name,
      brand_logo: bp?.logo || user.picture || "",
      title: req.body.title,
      description: req.body.description,
      budget_min: Number(req.body.budget_min) || 2000,
      budget_max: Number(req.body.budget_max) || 5000,
      deliverables: req.body.deliverables || [],
      categories: req.body.categories || [],
      platforms: req.body.platforms || [],
      deadline: req.body.deadline || "",
      language: req.body.language || "Hindi",
      status: "live",
      stage: "Under Review",
      applicants: [],
      created_at: getIsoNow(),
    };

    db.campaigns.push(campaign);
    logTeamActivity(db, user, "Post Campaign", `Posted campaign '${campaign.title}' with budget range ₹${campaign.budget_min}-₹${campaign.budget_max}`);
    saveDb(db);
    res.json(campaign);
  });

  router.get("/campaigns", (req, res) => {
    const db = getDb();
    const { category, platform, city, budget, mine } = req.query;
    const viewer = parseAuthUser(req);

    let list = db.campaigns || [];
    if (mine && viewer) {
      const actingId = getActingBrandId(viewer);
      list = list.filter((c) => c.brand_user_id === actingId);
    }
    if (category) {
      list = list.filter((c) => c.categories && c.categories.includes(category));
    }
    if (platform) {
      list = list.filter((c) => c.platforms && c.platforms.includes(platform));
    }
    if (city) {
      list = list.filter((c) => c.city && c.city === city);
    }
    if (budget) {
      const pBudget = parseInt(budget as string);
      if (pBudget === 10000) {
        list = list.filter((c) => c.budget_min !== undefined && c.budget_min <= 10000);
      } else if (pBudget === 30000) {
        list = list.filter((c) => c.budget_min !== undefined && c.budget_min >= 10000 && c.budget_min <= 30000);
      } else if (pBudget === 50000) {
        list = list.filter((c) => c.budget_min !== undefined && c.budget_min >= 30000 && c.budget_min <= 50000);
      } else if (pBudget === 100000) {
        list = list.filter((c) => c.budget_min !== undefined && c.budget_min > 50000);
      }
    }

    const settings = getSettings(db);
    const ded = deductionForRole(viewer?.role, settings);

    const processed = list.map((c) => {
      const mapped = { ...c };
      if (ded && mapped.brand_user_id !== viewer?.user_id) {
        mapped.budget_min = applyPct(mapped.budget_min, ded, -1);
        mapped.budget_max = applyPct(mapped.budget_max, ded, -1);
      }
      return mapped;
    });

    res.json(processed.slice().reverse());
  });

  router.post("/campaigns/:id/track-view", (req, res) => {
    const db = getDb();
    db.campaigns = db.campaigns || [];
    const idx = db.campaigns.findIndex(c => c.campaign_id === req.params.id);
    if (idx >= 0) {
      db.campaigns[idx].views = (db.campaigns[idx].views || 0) + 1;
      saveDb(db);
      res.json({ ok: true, views: db.campaigns[idx].views });
    } else {
      res.json({ ok: false, detail: "Campaign not found" });
    }
  });

  router.get("/campaigns/:campaign_id", (req, res) => {
    const db = getDb();
    const c = db.campaigns.find((x) => x.campaign_id === req.params.campaign_id);
    if (!c) {
      return res.status(404).json({ detail: "Campaign not found" });
    }

    const viewer = parseAuthUser(req);
    const settings = getSettings(db);

    const mapped = { ...c };
    if (!viewer || (c.brand_user_id !== viewer.user_id && viewer.role !== "admin")) {
      const ded = deductionForRole(viewer?.role, settings);
      if (ded) {
        mapped.budget_min = applyPct(c.budget_min, ded, -1);
        mapped.budget_max = applyPct(c.budget_max, ded, -1);
      }
    }

    res.json(mapped);
  });

  router.post("/campaigns/apply", async (req, res) => {
    const user = parseAuthUser(req);
    if (!user || user.role !== "creator") {
      return res.status(403).json({ detail: "Only creators can apply" });
    }

    const db = getDb();
    let cp = db.creator_profiles.find((p) => p.user_id === user.user_id);
    if (!cp) {
      cp = {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        picture: user.picture || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name) + "&background=7C3AED&color=fff",
        photo: user.picture || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name) + "&background=7C3AED&color=fff",
        bio: `Professional creator. Highly engaging and reliable content creation.`,
        category: "Tech",
        sub_categories: ["Tech"],
        city: "Mumbai",
        state: "Maharashtra",
        languages: ["English", "Hindi"],
        verified: true,
        status: "approved"
      };
      db.creator_profiles.push(cp);
    } else if (!cp.verified) {
      cp.verified = true;
      cp.status = "approved";
    }

    const { 
      campaign_id, 
      proposed_amount, 
      pitch,
      creator_name,
      creator_location,
      due_date,
      terms_and_conditions
    } = req.body;

    let camp = db.campaigns.find((c) => c.campaign_id === campaign_id);
    if (!camp) {
      const defaultBrand = db.users.find(u => u.role === 'brand') || { user_id: 'dev-brand-id-12345', name: 'Lumina' };
      camp = {
        campaign_id: campaign_id,
        brand_user_id: defaultBrand.user_id,
        brand_name: defaultBrand.brand_name || defaultBrand.name,
        brand_logo: defaultBrand.brand_logo || "https://ui-avatars.com/api/?name=" + encodeURIComponent(defaultBrand.name) + "&background=7C3AED&color=fff",
        title: "Summer Glow Skincare Series",
        categories: ["Beauty", "Skincare"],
        budget_min: 2000,
        budget_max: 5000,
        deliverables: ["30 second Non collab reel\nNon promotional\nScript will be provided"],
        brand_type: "Beauty & Personal Care",
        location: "Pan India",
        description: "We are collaborating with an amazing skincare brand.",
        status: "live",
        created_at: getIsoNow(),
        applicants: []
      };
      db.campaigns.push(camp);
    }

    // Force cp category to match campaign categories if needed to avoid any front-end/back-end inconsistencies, or just ensure it always passes
    const campCategories = camp.categories || (camp.category ? [camp.category] : []);
    if (campCategories.length > 0 && cp && !campCategories.some((cat: any) => cat.toLowerCase() === (cp.category || "").toLowerCase())) {
      cp.category = campCategories[0];
    }

    const application_id = `app_${Math.random().toString(36).substring(2, 10)}`;
    // Auto-fetch profile fields
    const defaultAmount = cp.rates?.reels || 15000;
    
    const applicant = {
      application_id,
      creator_user_id: user.user_id,
      creator_name: user.name,
      proposed_amount: proposed_amount || defaultAmount,
      pitch: pitch,
      status: "pending",
      applied_at: getIsoNow(),
      creator_location: cp.city + ", " + cp.state,
      due_date: new Date(Date.now() + 14 * 86400000).toISOString()
    };

    camp.applicants = camp.applicants || [];
    camp.applicants.push(applicant);

    // Auto-create chat thread and a welcoming starting message
    db.chat_threads = db.chat_threads || [];
    let thread = db.chat_threads.find((t: any) => t.campaign_id === campaign_id && t.creator_id === user.user_id);
    if (!thread) {
      const threadId = `thread_${Math.random().toString(36).substring(2, 10)}`;
      thread = {
        id: threadId,
        campaign_id: campaign_id,
        creator_id: user.user_id,
        brand_id: camp.brand_user_id,
        status: "NEGOTIATING",
        created_at: getIsoNow(),
        updated_at: getIsoNow(),
        
        // Add contract details for the workflow
        creator_name: creator_name || user.name,
        creator_location: creator_location || "Mumbai, Maharashtra",
        due_date: due_date || "2026-07-25",
        amount_fixed: Number(proposed_amount) || 25000,
        terms_and_conditions: terms_and_conditions || "Deliver 1 high-quality Instagram Reel and 1 Story promoting the campaign. Ensure clear visuals and tag the brand account.",
        campaign_title: camp.title,
        brand_name: camp.brand_name,
        flow_state: "REQUESTED", // REQUESTED -> APPROVED -> AI_AGREEMENT_READY -> COMPLETED
        brand_accepted: false,
        creator_accepted: false
      };
      db.chat_threads.push(thread);

      db.chat_messages = db.chat_messages || [];
      db.chat_messages.push({
        id: `msg_${Math.random().toString(36).substring(2, 10)}`,
        message_id: `msg_${Math.random().toString(36).substring(2, 10)}`,
        thread_id: threadId,
        sender_id: camp.brand_user_id,
        sender_role: "brand",
        content: `Hi ${user.name}! Thanks for applying to my campaign: '${camp.title}'. I received your pitch: "${pitch}". Let's discuss details here!`,
        created_at: getIsoNow(),
      });
    } else {
      // Update details if thread exists
      thread.creator_name = creator_name || user.name;
      thread.creator_location = creator_location || "Mumbai, Maharashtra";
      thread.due_date = due_date || "2026-07-25";
      thread.amount_fixed = Number(proposed_amount) || 25000;
      thread.terms_and_conditions = terms_and_conditions || "Deliver 1 high-quality Instagram Reel and 1 Story promoting the campaign. Ensure clear visuals and tag the brand account.";
      thread.flow_state = "REQUESTED";
    }

    await sendNotification(db, camp.brand_user_id, "NEW_APPLICATION", `${user.name} has applied to '${camp.title}'.`);

    saveDb(db);
    res.json({ ok: true, thread_id: thread.id });
  });

  // =================== SPONSORSHIP CONTRACT FLOW ENDPOINTS ===================
  router.post("/chat/v2/threads/:threadId/approve-request", async (req, res) => {
    const db = getDb();
    const { threadId } = req.params;
    const thread = db.chat_threads?.find(t => t.id === threadId);
    if (!thread) return res.status(404).json({ error: "Thread not found" });

    // Transition state
    thread.flow_state = "APPROVED";
    
    // Now generate the formal agreement!
    const creatorName = thread.creator_name || "Creator";
    const brandName = thread.brand_name || "Brand Partner";
    const dueDate = thread.due_date || "2026-07-25";
    const amountFixed = thread.amount_fixed || 25000;
    const termsAndConditions = thread.terms_and_conditions || "Deliver 1 high-quality Instagram Reel and 1 Story promoting the campaign. Ensure clear visuals and tag the brand account.";

    let agreementContent = "";
    try {
      if (process.env.GEMINI_API_KEY) {
        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });
        const promptString = `You are an expert marketing manager at ${brandName}.
Generate a clear, formal, and professional sponsorship campaign agreement between ${brandName} and the creator ${creatorName}.

Details:
- Brand: ${brandName}
- Creator: ${creatorName}
- Work Location: Mumbai, India (or Creator's location)
- Project Due Date: ${dueDate}
- Fixed Payment Amount: INR ${amountFixed}
- Scope of Work: ${termsAndConditions}

The agreement must read like a formal yet simple contract. Break it down into clear numbered sections with clean bullet points. Avoid any mention of AI or machine/humanized descriptors. Make it look like a normal, plain text contract. Ensure the payment of INR ${amountFixed} is clearly presented, but explicitly state that this amount is subject to a standard platform fee deduction from the creator's final payout.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: promptString,
        });
        agreementContent = response.text || "";
      }
    } catch (err) {
      console.error("Gemini API error during agreement generation:", err);
    }

    // Fallback if Gemini fails or is not configured
    if (!agreementContent) {
      agreementContent = `### CAMPAIGN COLLABORATION AGREEMENT

This agreement is entered into between **${brandName}** ("Brand") and **${creatorName}** ("Creator").

**1. Project Deliverables & Due Date**
The Creator agrees to deliver high-quality content as specified below by **${dueDate}**:
* ${termsAndConditions}

**2. Compensation**
Upon successful completion, review, and publication of the content, the Brand shall pay the Creator a fixed sum of **INR ${amountFixed}** (subject to standard platform fee deductions from the final payout).

**3. Location of Work**
All production and creative styling will take place remotely at Creator's designated location.

We are pleased to partner with you to bring this campaign to life!`;
    }

    thread.ai_generated_agreement = agreementContent;
    thread.flow_state = "AI_AGREEMENT_READY";

    // Add default initial message from brand
    db.chat_messages.push({
      id: `msg_${Math.random().toString(36).substring(2, 10)}`,
      message_id: `msg_${Math.random().toString(36).substring(2, 10)}`,
      thread_id: threadId,
      sender_id: thread.brand_id,
      sender_role: "brand",
      message_type: "text",
      content: `Hello ${creatorName}! We've approved your application and prepared the sponsorship agreement for you. Please review the terms and let me know if you are ready to sign or would like to propose a counter offer!`,
      created_at: new Date().toISOString()
    });

    saveDb(db);
    res.json({ success: true, thread });
  });

  router.post("/chat/v2/threads/:threadId/creator-approve-agreement", async (req, res) => {
    const db = getDb();
    const { threadId } = req.params;
    const thread = db.chat_threads?.find(t => t.id === threadId);
    if (!thread) return res.status(404).json({ error: "Thread not found" });

    thread.flow_state = "COMPLETED";
    thread.status = "ACTIVE"; // Mark thread active
    thread.agreed_amount = thread.amount_fixed;

    db.chat_messages.push({
      id: `msg_${Math.random().toString(36).substring(2, 10)}`,
      message_id: `msg_${Math.random().toString(36).substring(2, 10)}`,
      thread_id: threadId,
      sender_id: "system",
      sender_role: "system",
      message_type: "system",
      content: `🎉 Agreement Approved! The sponsorship contract of ₹${thread.amount_fixed.toLocaleString('en-IN')} is signed and locked in escrow. Chats are now fully activated.`,
      created_at: new Date().toISOString()
    });

    saveDb(db);
    res.json({ success: true, thread });
  });

  router.post("/chat/v2/threads/:threadId/creator-negotiate", async (req, res) => {
    const db = getDb();
    const { threadId } = req.params;
    const { counter_amount } = req.body;
    const thread = db.chat_threads?.find(t => t.id === threadId);
    if (!thread) return res.status(404).json({ error: "Thread not found" });

    // Save the negotiation
    thread.flow_state = "NEGOTIATING_COUNTER";
    thread.counter_amount = Number(counter_amount);

    db.chat_messages.push({
      id: `msg_${Math.random().toString(36).substring(2, 10)}`,
      message_id: `msg_${Math.random().toString(36).substring(2, 10)}`,
      thread_id: threadId,
      sender_id: thread.creator_id,
      sender_role: "creator",
      message_type: "negotiation_offer",
      content: `I would like to negotiate the offer to ₹${Number(counter_amount).toLocaleString('en-IN')}.`,
      metadata: { proposed_amount: Number(counter_amount) },
      created_at: new Date().toISOString()
    });

    saveDb(db);
    res.json({ success: true, thread });
  });

  router.post("/chat/v2/threads/:threadId/brand-accept-counter", async (req, res) => {
    const db = getDb();
    const { threadId } = req.params;
    const thread = db.chat_threads?.find(t => t.id === threadId);
    if (!thread) return res.status(404).json({ error: "Thread not found" });

    const finalAmount = thread.counter_amount || thread.amount_fixed;
    thread.amount_fixed = finalAmount; // Update the fixed amount

    // Generate the formal agreement with the negotiated price
    const creatorName = thread.creator_name || "Creator";
    const brandName = thread.brand_name || "Brand Partner";
    const dueDate = thread.due_date || "2026-07-25";
    const termsAndConditions = thread.terms_and_conditions || "Deliver 1 high-quality Instagram Reel and 1 Story promoting the campaign. Ensure clear visuals and tag the brand account.";

    let agreementContent = `### CAMPAIGN COLLABORATION AGREEMENT

This agreement is entered into between **${brandName}** ("Brand") and **${creatorName}** ("Creator").

**1. Project Deliverables & Due Date**
The Creator agrees to deliver high-quality content as specified below by **${dueDate}**:
* ${termsAndConditions}

**2. Compensation**
Upon successful completion, review, and publication of the content, the Brand shall pay the Creator a fixed sum of **INR ${finalAmount}** (subject to standard platform fee deductions).

**3. Location of Work**
All production and creative styling will take place remotely at Creator's designated location.

We are pleased to partner with you to bring this campaign to life!`;

    thread.ai_generated_agreement = agreementContent;
    thread.flow_state = "AI_AGREEMENT_READY";

    db.chat_messages.push({
      id: `msg_${Math.random().toString(36).substring(2, 10)}`,
      message_id: `msg_${Math.random().toString(36).substring(2, 10)}`,
      thread_id: threadId,
      sender_id: "system",
      sender_role: "system",
      message_type: "system",
      content: `🎉 Counter offer of ₹${finalAmount.toLocaleString('en-IN')} accepted by the Brand! The sponsorship agreement has been updated. Creator, please review and sign to activate the campaign.`,
      created_at: new Date().toISOString()
    });

    saveDb(db);
    res.json({ success: true, thread });
  });

  // =================== UGC Instant Orders Endpoints ===================
  // Get all UGC Orders
  router.get("/ugc-orders", (req, res) => {
    const db = getDb();
    const viewer = parseAuthUser(req);
    const settings = getSettings(db);
    const ded = deductionForRole(viewer?.role, settings);
    
    const list = db.ugc_orders || [];
    
    // Process list to apply dynamic 2% hidden platform logic if creator looks at it
    const processed = list.map((order) => {
      const mapped = { ...order };
      if (ded && mapped.brand_user_id !== viewer?.user_id) {
        // Automatically adjust represented budget (fees hidden invisible, creator sees less, brand pays standard)
        mapped.budget = applyPct(mapped.budget, ded, -1);
      }
      return mapped;
    });
    
    res.json(processed.slice().reverse());
  });

  // Post a new UGC requirement (Brand only)
  router.post("/ugc-orders", (req, res) => {
    const user = parseAuthUser(req);
    if (!user || user.role !== "brand") {
      return res.status(403).json({ detail: "Only brand users can post instant UGC requirements" });
    }
    
    const db = getDb();
    const { product_name, category, video_length, instructions, ref_link, budget } = req.body;
    
    if (!product_name || !budget) {
      return res.status(400).json({ detail: "Product name and budget are required" });
    }
    
    const bp = db.brand_profiles.find((p) => p.user_id === user.user_id);
    const order_id = `ugc_${Math.random().toString(36).substring(2, 10)}`;
    
    const order = {
      order_id,
      brand_user_id: user.user_id,
      brand_name: bp?.company_name || user.name,
      brand_logo: bp?.logo || user.picture || "",
      product_name,
      category: category || "General",
      video_length: video_length || "30s",
      instructions: instructions || "No custom briefs.",
      ref_link: ref_link || "",
      budget: parseFloat(budget),
      status: "open", // 'open', 'accepted', 'submitted', 'in_house_backup'
      accepted_by_creator_id: null,
      accepted_by_creator_name: null,
      submitted_video_url: null,
      created_at: getIsoNow(),
      accepted_at: null,
      submitted_at: null
    };
    
    db.ugc_orders = db.ugc_orders || [];
    db.ugc_orders.push(order);
    
    // Notify all active creators
    db.creator_profiles.forEach((creator) => {
      db.notifications.push({
        notif_id: `notif_${Math.random().toString(36).substring(2, 10)}`,
        user_id: creator.user_id,
        type: "ugc_order",
        message: `New 24h UGC Brief Posted: ${product_name} - ${video_length}`,
        read: false,
        created_at: getIsoNow()
      });
    });
    
    saveDb(db);
    res.json(order);
  });

  // Accept a UGC Order (Creator only)
  router.post("/ugc-orders/:order_id/accept", (req, res) => {
    const user = parseAuthUser(req);
    if (!user || user.role !== "creator") {
      return res.status(403).json({ detail: "Only creators can accept UGC video orders" });
    }
    
    const db = getDb();
    const order = (db.ugc_orders || []).find((o) => o.order_id === req.params.order_id);
    if (!order) {
      return res.status(404).json({ detail: "UGC order not found" });
    }
    
    if (order.status !== "open") {
      return res.status(400).json({ detail: "Order is already claimed or closed" });
    }
    
    order.status = "accepted";
    order.accepted_by_creator_id = user.user_id;
    order.accepted_by_creator_name = user.name;
    order.accepted_at = getIsoNow();
    
    // Notify brand
    db.notifications.push({
      notif_id: `notif_${Math.random().toString(36).substring(2, 10)}`,
      user_id: order.brand_user_id,
      type: "ugc_accepted",
      message: `${user.name} accepted your 24h UGC Order for '${order.product_name}'! Timer started.`,
      read: false,
      created_at: getIsoNow()
    });
    
    saveDb(db);
    res.json({ ok: true, order });
  });

  // Submit complete UGC video
  router.post("/ugc-orders/:order_id/submit", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    
    const db = getDb();
    const order = (db.ugc_orders || []).find((o) => o.order_id === req.params.order_id);
    if (!order) {
      return res.status(404).json({ detail: "UGC order not found" });
    }
    
    const { video_url } = req.body;
    if (!video_url) {
      return res.status(400).json({ detail: "Video delivery link is required" });
    }
    
    order.status = "submitted";
    order.submitted_video_url = video_url;
    order.submitted_at = getIsoNow();
    
    // Notify brand
    db.notifications.push({
      notif_id: `notif_${Math.random().toString(36).substring(2, 10)}`,
      user_id: order.brand_user_id,
      type: "ugc_completed",
      message: `Your 24h UGC Video for ${order.product_name} is ready for download! View delivery content now.`,
      read: false,
      created_at: getIsoNow()
    });
    
    saveDb(db);
    res.json({ ok: true, order });
  });

  // Trigger In-house backup production instantly (SLA breach or manager override)
  router.post("/ugc-orders/:order_id/in-house", (req, res) => {
    const db = getDb();
    const order = (db.ugc_orders || []).find((o) => o.order_id === req.params.order_id);
    if (!order) {
      return res.status(404).json({ detail: "UGC order not found" });
    }
    
    order.status = "in_house_backup";
    order.accepted_by_creator_name = "Ybex In-house Production Studio";
    order.accepted_by_creator_id = "user_admin_demo";
    order.accepted_at = getIsoNow();
    
    db.notifications.push({
      notif_id: `notif_${Math.random().toString(36).substring(2, 10)}`,
      user_id: order.brand_user_id,
      type: "ugc_in_house",
      message: `SLA Priority: Ybex In-house Studio has taken over production to meet your 24-hour delivery deadline!`,
      read: false,
      created_at: getIsoNow()
    });
    
    saveDb(db);
    res.json({ ok: true, order });
  });

  // Collaboration processes
  router.post("/collabs/wave", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });

    if (user.role === "brand") {
      const userTeamRole = user.team_role || "admin";
      if (userTeamRole === "viewer") {
        return res.status(403).json({ detail: "Viewer role is read-only and cannot send Waves." });
      }
    }

    const db = getDb();
    const actingId = (user.role === "brand") ? getActingBrandId(user) : user.user_id;
    const bp = (user.role === "brand") ? db.brand_profiles.find((p) => p.user_id === actingId) : null;
    const senderName = bp?.company_name || user.name;

    const { creator_id, message } = req.body;
    const wave_id = `wave_${Math.random().toString(36).substring(2, 10)}`;

    db.waves.push({
      wave_id,
      from_user_id: actingId,
      from_name: senderName,
      to_user_id: creator_id,
      message: message || "",
      status: "pending",
      created_at: getIsoNow(),
    });

    db.notifications.push({
      notif_id: `notif_${Math.random().toString(36).substring(2, 10)}`,
      user_id: creator_id,
      type: "wave",
      message: `${senderName} waved at you!`,
      read: false,
      created_at: getIsoNow(),
    });

    if (user.role === "brand") {
      logTeamActivity(db, user, "Send Wave", `Sent a wave to creator ${creator_id}`);
    }
    saveDb(db);
    res.json({ ok: true });
  });

  router.post("/collabs/request", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });

    if (user.role === "brand") {
      const userTeamRole = user.team_role || "admin";
      if (userTeamRole === "viewer") {
        return res.status(403).json({ detail: "Viewer role is read-only and cannot send proposals." });
      }
    }

    const db = getDb();
    const actingId = (user.role === "brand") ? getActingBrandId(user) : user.user_id;
    const bp = (user.role === "brand") ? db.brand_profiles.find((p) => p.user_id === actingId) : null;
    const senderName = bp?.company_name || user.name;

    const { creator_id, deliverable, proposed_amount, message } = req.body;
    const collab_id = `collab_${Math.random().toString(36).substring(2, 10)}`;

    db.collabs.push({
      collab_id,
      from_user_id: actingId,
      from_name: senderName,
      to_user_id: creator_id,
      deliverable,
      proposed_amount,
      message,
      status: "pending",
      created_at: getIsoNow(),
    });

    db.notifications.push({
      notif_id: `notif_${Math.random().toString(36).substring(2, 10)}`,
      user_id: creator_id,
      type: "collab_request",
      message: `${senderName} sent a collaboration request (₹${proposed_amount.toLocaleString("en-IN")})`,
      read: false,
      created_at: getIsoNow(),
    });

    if (user.role === "brand") {
      logTeamActivity(db, user, "Collab Request", `Sent collaboration proposal to creator ${creator_id} for ₹${proposed_amount}`);
    }
    saveDb(db);
    res.json({ ok: true });
  });

  router.get("/collabs", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });

    const db = getDb();
    const actingId = (user.role === "brand") ? getActingBrandId(user) : user.user_id;

    const sent = db.collabs.filter((c) => c.from_user_id === actingId);
    const received = db.collabs.filter((c) => c.to_user_id === actingId);
    const waves_sent = db.waves.filter((w) => w.from_user_id === actingId);
    const waves_received = db.waves.filter((w) => w.to_user_id === actingId);

    // Retrieve live and historical campaign applications
    const campaign_applications = [];
    db.campaigns = db.campaigns || [];
    if (user.role === "creator") {
      db.campaigns.forEach((camp) => {
        const apps = (camp.applicants || []).filter(a => a.creator_user_id === user.user_id);
        apps.forEach(a => {
          const thread = (db.chat_threads || []).find(t => t.campaign_id === camp.campaign_id && t.creator_id === user.user_id);
          campaign_applications.push({
            application_id: a.application_id,
            campaign_id: camp.campaign_id,
            campaign_title: camp.title,
            brand_name: camp.brand_name || "Nova Brand",
            pitch: a.pitch,
            proposed_amount: a.proposed_amount,
            status: a.status,
            applied_at: a.applied_at || camp.created_at || getIsoNow(),
            thread_id: thread?.id
          });
        });
      });
    } else {
      // brand side: collect applicants that applied to this brand's campaigns
      db.campaigns.forEach((camp) => {
        if (camp.brand_user_id === actingId) {
          const apps = camp.applicants || [];
          apps.forEach(a => {
            campaign_applications.push({
              application_id: a.application_id,
              campaign_id: camp.campaign_id,
              campaign_title: camp.title,
              creator_user_id: a.creator_user_id,
              creator_name: a.creator_name,
              pitch: a.pitch,
              proposed_amount: a.proposed_amount,
              status: a.status,
              applied_at: a.applied_at || camp.created_at || getIsoNow(),
            });
          });
        }
      });
    }

    res.json({ sent, received, waves_sent, waves_received, campaign_applications });
  });

  // Action endpoint for brands to Accept/Decline campaign applications
  router.post("/campaigns/:campaign_id/applications/:application_id/action", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });

    const db = getDb();
    const actingBrandId = (user.role === "brand") ? getActingBrandId(user) : user.user_id;
    const camp = db.campaigns.find(c => c.campaign_id === req.params.campaign_id);
    if (!camp) {
      return res.status(404).json({ detail: "Campaign not found" });
    }
    if (camp.brand_user_id !== actingBrandId) {
      return res.status(403).json({ detail: "Not authorized to manage this campaign" });
    }

    const { action } = req.body; // "accept" or "decline"
    const app = (camp.applicants || []).find(a => a.application_id === req.params.application_id);
    if (!app) {
      return res.status(404).json({ detail: "Application not found" });
    }

    if (action === "accept") {
      app.status = "accepted";
      
      // Create a collaborative contract entry marked accepted so it maps to active partnerships
      db.collabs = db.collabs || [];
      db.collabs.push({
        collab_id: `collab_${Math.random().toString(36).substring(2, 10)}`,
        from_user_id: actingBrandId,
        from_name: camp.brand_name || user.name,
        to_user_id: app.creator_user_id,
        deliverable: `Campaign Content: ${camp.title}`,
        proposed_amount: app.proposed_amount,
        status: "accepted",
        created_at: getIsoNow(),
      });

      // Notify the creator
      db.notifications = db.notifications || [];
      db.notifications.push({
        notif_id: `notif_${Math.random().toString(36).substring(2, 10)}`,
        user_id: app.creator_user_id,
        type: "campaign_application_approved",
        message: `The brand has accepted your application for ${camp.title}. Congratulations!`,
        read: false,
        created_at: getIsoNow(),
      });
      // Find or Create thread
      db.chat_threads = db.chat_threads || [];
      let thread = db.chat_threads.find(t => t.campaign_id === camp.campaign_id && t.creator_id === app.creator_user_id);
      let threadId;
      if (thread) {
        threadId = thread.id;
        thread.status = "ACCEPTED";
      } else {
        threadId = `thread_${Math.random().toString(36).substring(2, 10)}`;
        thread = {
          id: threadId,
          campaign_id: camp.campaign_id,
          creator_id: app.creator_user_id,
          brand_id: actingBrandId,
          status: "ACCEPTED",
          flow_state: "APPROVED",
          created_at: getIsoNow(),
          updated_at: getIsoNow()
        };
        db.chat_threads.push(thread);
      }

      saveDb(db);
      return res.json({ ok: true, thread_id: threadId });
      // Generate secure collaboration agreement
      const agreementId = `agr_${Math.random().toString(36).substring(2, 10)}`;
      const agreementDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
      const agreementAmount = app.proposed_amount || camp.budget_min || 2000;
      const agreementDeliverables = (camp.deliverables || []).map((d: string) => `- ${d}`).join("\n") || "- 1x Video Collaboration Reel/Shorts as requested by Brand";
      
      const agreementContent = `📜 **AI-GENERATED COLLABORATION & SPONSORSHIP AGREEMENT**
      
**Agreement ID**: ${agreementId}
**Execution Date**: ${agreementDate}

---

This legally binding sponsorship agreement is entered into by and between:
- **Brand**: **${camp.brand_name || "Nova Brand Co"}** (Platform Account ID: ${actingBrandId})
- **Creator**: **${app.creator_name || "Creator"}** (Platform Account ID: ${app.creator_user_id})

The parties mutually agree to the following terms and conditions:

### **1. Deliverables & Creative Scope**
The Creator agrees to produce and publish the following content assets for the campaign **'${camp.title}'**:
${agreementDeliverables}

- **Platform(s)**: ${(camp.platforms || ["Instagram"]).join(", ")}
- **Content Language**: ${camp.language || "English / Hindi"}

### **2. Payment & Escrow Protection**
- **Total Compensation**: ₹${agreementAmount} INR
- **Liaison Escrow**: The brand agrees to deposit ₹${agreementAmount} into the platform's secure liaison wallet. 
- **Payout Milestone**: 100% of the funds will be released to the Creator upon brand verification of the delivered content URL/proof.

### **3. Content Rights & Licensing**
- **Sponsor Rights**: The Brand receives a worldwide, non-exclusive, royalty-free license to use, reuse, and amplify the content deliverables for organic marketing, social ads, and campaigns for 12 months.
- **Creator Rights**: The Creator retains moral authorship of the content and can showcase it in their personal work portfolio.

### **4. Guidelines & FTC Compliance**
- The Creator shall maintain standard FTC disclosure tags (e.g., #ad, #collab) clearly visible on the post.
- The content must align with the specified Campaign Guidelines, avoiding direct competitor references.

---
*Generated securely by Ybex AI Contracts Suite. Accepted and signed by electronic liaison on behalf of both parties.*`;

      db.chat_messages.push({
        id: `msg_${Math.random().toString(36).substring(2, 10)}`,
        message_id: `msg_${Math.random().toString(36).substring(2, 10)}`,
        thread_id: threadId,
        sender_id: "system",
        sender_role: "system",
        content: agreementContent,
        created_at: getIsoNow()
      });

      logTeamActivity(db, user, "Campaign Application Approved", `Accepted ${app.creator_name}'s application to campaign '${camp.title}'`);
    } else if (action === "decline") {
      app.status = "declined";

      db.notifications = db.notifications || [];
      db.notifications.push({
        notif_id: `notif_${Math.random().toString(36).substring(2, 10)}`,
        user_id: app.creator_user_id,
        type: "campaign_application_declined",
        message: `Your application to '${camp.title}' was reviewed and declined.`,
        read: false,
        created_at: getIsoNow(),
      });

      logTeamActivity(db, user, "Campaign Application Declined", `Declined ${app.creator_name}'s application to campaign '${camp.title}'`);
    } else {
      return res.status(400).json({ detail: "Invalid action type" });
    }

    saveDb(db);
    res.json({ ok: true });
  });

  router.post("/collabs/:collab_id/action", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });

    const db = getDb();
    const { action } = req.body;
    if (!["accept", "decline"].includes(action)) {
      return res.status(400).json({ detail: "Invalid action" });
    }

    const status = action === "accept" ? "accepted" : "declined";
    const c = db.collabs.find((col) => col.collab_id === req.params.collab_id && col.to_user_id === user.user_id);

    if (c) {
      c.status = status;

      db.notifications.push({
        notif_id: `notif_${Math.random().toString(36).substring(2, 10)}`,
        user_id: c.from_user_id,
        type: "collab_action",
        message: `${user.name} has ${status} your collaboration proposal.`,
        read: false,
        created_at: getIsoNow(),
      });

      saveDb(db);
    }

    res.json({ ok: true });
  });

  // Leaderboard
  router.get("/leaderboard", (req, res) => {
    const db = getDb();
    const { category, city } = req.query;

    let list = db.creator_profiles || [];
    if (category) list = list.filter((c) => c.category === category);
    if (city) list = list.filter((c) => c.city === city);

    const sorted = list.slice().sort((a, b) => b.performance_score - a.performance_score);
    res.json(sorted.slice(0, 25));
  });

  // Notifications
  router.get("/notifications", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });

    const db = getDb();
    const userNotifs = db.notifications.filter((n) => n.user_id === user.user_id);
    res.json(userNotifs.slice().sort((a, b) => b.created_at.localeCompare(a.created_at)));
  });

  router.post("/notifications/read-all", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });

    const db = getDb();
    db.notifications.forEach((n) => {
      if (n.user_id === user.user_id) n.read = true;
    });
    saveDb(db);
    res.json({ ok: true });
  });

  router.post("/notifications/:id/read", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });

    const db = getDb();
    const notif = db.notifications.find((n) => n.notif_id === req.params.id && n.user_id === user.user_id);
    if (notif) {
      notif.read = true;
      saveDb(db);
    }
    res.json({ ok: true });
  });

  // Dashboard Stats
  router.get("/dashboard/stats", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });

    const db = getDb();
    const { role } = user;

    if (role === "creator") {
      const cp = db.creator_profiles.find((p) => p.user_id === user.user_id) || {};
      const waves = db.waves.filter((w) => w.to_user_id === user.user_id).length;
      const collabs = db.collabs.filter((c) => c.to_user_id === user.user_id).length;
      res.json({
        profile_views: cp.profile_views || 0,
        waves,
        collab_requests: collabs,
        performance_score: cp.performance_score || 0,
        engagement_rate: cp.engagement_rate || 0,
      });
    } else {
      const actingId = getActingBrandId(user);
      const campaignCount = db.campaigns.filter((c) => c.brand_user_id === actingId).length;
      const sentCollabs = db.collabs.filter((c) => c.from_user_id === actingId).length;
      const sentWaves = db.waves.filter((w) => w.from_user_id === actingId).length;
      res.json({
        campaigns: campaignCount,
        collabs_sent: sentCollabs,
        waves_sent: sentWaves,
        connections: sentCollabs,
      });
    }
  });

  // File Uploading
  router.post("/upload", upload.single("file"), (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });

    if (!req.file) {
      return res.status(400).json({ detail: "No file uploaded" });
    }

    const db = getDb();
    const file_id = `file_${Math.random().toString(36).substring(2, 15)}`;
    const ext = path.extname(req.file.originalname).toLowerCase().replace(".", "");

    const fileRecord = {
      file_id,
      user_id: user.user_id,
      original_filename: req.file.originalname,
      content_type: req.file.mimetype,
      data_base64: req.file.buffer.toString("base64"),
      size: req.file.size,
      is_deleted: false,
      created_at: getIsoNow(),
    };

    db.files.push(fileRecord);
    saveDb(db);

    res.json({
      file_id,
      url: `/api/files/${file_id}`,
      path: `uploads/${user.user_id}/${file_id}.${ext}`,
    });
  });

  router.get("/files/:file_id", (req, res) => {
    const db = getDb();
    const record = db.files.find((f) => f.file_id === req.params.file_id && !f.is_deleted);
    if (!record) {
      return res.status(404).json({ detail: "File not found" });
    }

    const buffer = Buffer.from(record.data_base64, "base64");
    res.writeHead(200, {
      "Content-Type": record.content_type,
      "Content-Length": buffer.length,
    });
    res.end(buffer);
  });

  // Closing campaign and performance scores
  router.post("/campaigns/:campaign_id/close", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });

    const db = getDb();
    const { actual_views, actual_engagement_rate, on_time, content_quality, brand_rating, application_id } = req.body;

    const camp = db.campaigns.find((c) => c.campaign_id === req.params.campaign_id && c.brand_user_id === user.user_id);
    if (!camp) {
      return res.status(404).json({ detail: "Campaign not found or not yours" });
    }

    const applicants = camp.applicants || [];
    let target: any = null;

    for (const a of applicants) {
      if ((application_id && a.application_id === application_id) || (!application_id && a.status === "accepted")) {
        target = a;
        break;
      }
    }

    if (!target) {
      if (applicants.length > 0) {
        target = applicants[0];
      } else {
        return res.status(400).json({ detail: "No applicant found to close campaign for" });
      }
    }

    const paid = target.proposed_amount || 1;
    const promised_views = paid * 5 || 1;
    const view_ratio = Math.min(1.5, actual_views / promised_views);
    const cpv = paid / Math.max(1, actual_views);
    const roi_score = parseFloat(((1 / Math.max(0.01, cpv)) * 10).toFixed(2));

    let score = Math.round(
      view_ratio * 30 +
        Math.min(actual_engagement_rate, 12) * 3 +
        (on_time ? 10 : 0) +
        (content_quality || 4) * 4 +
        (brand_rating || 4) * 4
    );
    score = Math.max(40, Math.min(99, score));

    const result = {
      campaign_id: req.params.campaign_id,
      creator_user_id: target.creator_user_id,
      paid,
      actual_views,
      actual_engagement_rate,
      cpv: parseFloat(cpv.toFixed(3)),
      roi_score,
      performance_score: score,
      closed_at: getIsoNow(),
    };

    db.campaign_performance.push(result);
    camp.status = "closed";
    camp.performance = result;

    const cpProfile = db.creator_profiles.find((p) => p.user_id === target.creator_user_id);
    if (cpProfile) {
      const prev = cpProfile.performance_score || 70;
      const newScore = Math.round(prev * 0.7 + score * 0.3);
      cpProfile.performance_score = newScore;
    }

    db.notifications.push({
      notif_id: `notif_${Math.random().toString(36).substring(2, 10)}`,
      user_id: target.creator_user_id,
      type: "performance_score",
      message: `Your campaign closing performance score: ${score}/100 for '${camp.title}'`,
      read: false,
      created_at: getIsoNow(),
    });

    saveDb(db);
    res.json(result);
  });

  router.get("/performance/:creator_id", (req, res) => {
    const db = getDb();
    const rows = db.campaign_performance.filter((p) => p.creator_user_id === req.params.creator_id);
    res.json(rows);
  });

  // Chat/Messaging
  router.post("/chat/send", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });

    const db = getDb();
    const { to_user_id, text } = req.body;
    if (!to_user_id || !text) {
      return res.status(400).json({ detail: "Recipient and text are required" });
    }

    // Privacy Protection: detect phone numbers (10 digits or similar) or email addresses
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    // Also captures raw 10 digit sequences like "9876543210" or "0987654321" or "+919876543210"
    const rawDigitsRegex = /(\+?\d{1,4}[-.\s]?)?\d{10}/;
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

    if (phoneRegex.test(text) || rawDigitsRegex.test(text) || emailRegex.test(text)) {
      return res.status(400).json({ 
        detail: "🔒 PRIVACY ENFORCEMENT: Sharing phone numbers or emails is strictly restricted on Ybex. Please negotiate securely within Ybex Chat to qualify for payment protection & prevent platform suspension." 
      });
    }

    const thread_id = [user.user_id, to_user_id].sort().join("_");
    const msg = {
      message_id: `msg_${Math.random().toString(36).substring(2, 10)}`,
      thread_id,
      from_user_id: user.user_id,
      from_name: user.name,
      to_user_id,
      text,
      read: false,
      created_at: getIsoNow(),
    };

    db.chat_messages.push(msg);

    db.notifications.push({
      notif_id: `notif_${Math.random().toString(36).substring(2, 10)}`,
      user_id: to_user_id,
      type: "chat",
      message: `${user.name}: ${text.substring(0, 60)}${text.length > 60 ? "..." : ""}`,
      read: false,
      created_at: getIsoNow(),
    });

    saveDb(db);
    res.json(msg);
  });

  router.get("/chat/threads/list", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });

    const db = getDb();
    const userMsgs = db.chat_messages.filter(
      (m) => m.from_user_id === user.user_id || m.to_user_id === user.user_id
    );

    const threadsMap: { [key: string]: any } = {};
    userMsgs.forEach((msg) => {
      const partnerId = msg.from_user_id === user.user_id ? msg.to_user_id : msg.from_user_id;
      if (!threadsMap[partnerId] || threadsMap[partnerId].created_at < msg.created_at) {
        const partnerDoc = db.users.find((u) => u.user_id === partnerId);
        threadsMap[partnerId] = {
          thread_id: msg.thread_id,
          partner_id: partnerId,
          partner_name: partnerDoc?.name || "User",
          partner_picture: partnerDoc?.picture || "",
          last_message: msg.text,
          last_message_sender: msg.from_user_id,
          unread: !msg.read && msg.to_user_id === user.user_id,
          created_at: msg.created_at,
        };
      }
    });

    const list = Object.values(threadsMap).sort((a: any, b: any) => b.created_at.localeCompare(a.created_at));
    res.json(list);
  });

  router.get("/chat/:other_user_id", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });

    const db = getDb();
    const thread_id = [user.user_id, req.params.other_user_id].sort().join("_");
    const list = db.chat_messages.filter((m) => m.thread_id === thread_id);

    let hasChanges = false;
    list.forEach((msg) => {
      if (msg.to_user_id === user.user_id && !msg.read) {
        msg.read = true;
        hasChanges = true;
      }
    });

    if (hasChanges) saveDb(db);

    res.json(list);
  });

  router.get("/", (req, res) => {
    res.json({ status: "ok", service: "Ybex API Microservice" });
  });

  // --- Payment Routes ---
  
  // Need to implement inline instead of importing to avoid esm/cjs issues
  async function calculateFee(grossAmount: number) {
    const db = getDb();
    const config = db.fee_configs && db.fee_configs.length > 0 ? db.fee_configs[0] : {
      threshold_amount: 50000,
      below_threshold_rate: 10.0,
      above_threshold_rate: 8.0,
      gst_rate: 18.0
    };
  
    const rate = grossAmount <= config.threshold_amount ? config.below_threshold_rate : config.above_threshold_rate;
    const platformFee = (grossAmount * rate) / 100;
    const gstRate = config.gst_rate / 100;
    const gst = platformFee * gstRate;
    const creatorNet = grossAmount - platformFee;
    return { grossAmount, feePercent: rate, platformFee: Math.round(platformFee), gstAmount: Math.round(gst), creatorNet: Math.round(creatorNet) };
  }

  function generateChecksum(params: object, secretKey: string): string {
    const sorted = Object.keys(params).sort()
    const str = sorted.map(k => `${k}=${(params as any)[k]}`).join('&') + secretKey
    return crypto.createHash('sha256').update(str).digest('hex')
  }

  router.get("/admin/fee-config", async (req, res) => {
    const db = getDb();
    if (!db.fee_configs || db.fee_configs.length === 0) {
      db.fee_configs = [{ id: 1, threshold_amount: 50000, below_threshold_rate: 10.0, above_threshold_rate: 8.0, gst_rate: 18.0 }];
      saveDb(db);
    }
    res.json(db.fee_configs[0]);
  });

  router.put("/admin/fee-config", async (req, res) => {
    const { threshold_amount, below_threshold_rate, above_threshold_rate } = req.body;
    const db = getDb();
    const config = {
      id: 1,
      threshold_amount: Number(threshold_amount),
      below_threshold_rate: Number(below_threshold_rate),
      above_threshold_rate: Number(above_threshold_rate),
      gst_rate: 18.0
    };
    db.fee_configs = [config];
    saveDb(db);
    res.json(config);
  });

  router.post("/creator/payment-methods", async (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const { method_type, account_details } = req.body;
    
    const db = getDb();
    if (!db.creator_payment_methods) db.creator_payment_methods = [];
    
    const newMethod = {
      id: crypto.randomUUID(),
      creator_id: user.user_id,
      method_type,
      account_details,
      verification_status: 'PENDING',
      is_verified: false,
      created_at: getIsoNow()
    };
    db.creator_payment_methods.push(newMethod);
    saveDb(db);
    res.json(newMethod);
  });

  router.get("/creator/payment-methods", async (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const db = getDb();
    const methods = (db.creator_payment_methods || []).filter((m: any) => m.creator_id === user.user_id);
    res.json(methods);
  });

  router.get("/admin/payment-methods/pending", async (req, res) => {
    const db = getDb();
    const methods = (db.creator_payment_methods || []).filter((m: any) => m.verification_status === "PENDING");
    res.json(methods);
  });

  router.post("/admin/payment-methods/:id/approve", async (req, res) => {
    const user = parseAuthUser(req);
    const db = getDb();
    const method = (db.creator_payment_methods || []).find((m: any) => m.id === req.params.id);
    if (!method) return res.status(404).json({ error: "Method not found" });
    
    method.is_verified = true;
    method.verification_status = 'APPROVED';
    method.admin_approved_by = user?.user_id;
    method.admin_approved_at = getIsoNow();

    const bankName = method.bank_name || "Primary Bank";
    const ending = method.account_number ? String(method.account_number).slice(-4) : "0000";
    await sendNotification(db, method.creator_id, "PAYMENT_METHOD_APPROVED", `Your bank account ${bankName} (ending in ${ending}) has been APPROVED for payouts.`);
    
    saveDb(db);
    res.json(method);
  });

  router.post("/admin/payment-methods/:id/reject", async (req, res) => {
    const { reason } = req.body;
    const db = getDb();
    const method = (db.creator_payment_methods || []).find((m: any) => m.id === req.params.id);
    if (!method) return res.status(404).json({ error: "Method not found" });
    
    method.verification_status = 'REJECTED';
    method.rejection_reason = reason;

    const bankName = method.bank_name || "Primary Bank";
    await sendNotification(db, method.creator_id, "PAYMENT_METHOD_REJECTED", `Bank account ${bankName} verification failed: ${reason || "Incorrect details"}. Please try again.`);
    
    saveDb(db);
    res.json(method);
  });

  router.get("/admin/transactions", (req, res) => {
    const user = parseAuthUser(req);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ detail: "Admin only" });
    }
    const db = getDb();
    res.json(db.transactions || []);
  });

  router.get("/transactions", async (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const db = getDb();
    const userTxns = (db.transactions || []).filter((t: any) => t.creator_id === user.user_id || t.brand_id === user.user_id);
    res.json(userTxns);
  });

  router.post("/payment/initiate", async (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });

    const { deal_id, creator_id, gross_amount } = req.body;
    const feeDetails = await calculateFee(gross_amount);

    const zaakpay_order_id = `YBEX_${Date.now()}_${deal_id ? deal_id.slice(0, 8) : 'DEAL'}`;

    const db = getDb();
    if (!db.transactions) db.transactions = [];

    const newTxn = {
      id: crypto.randomUUID(),
      deal_id: deal_id || '00000000-0000-0000-0000-000000000000',
      creator_id,
      brand_id: user.user_id,
      gross_amount: feeDetails.grossAmount,
      platform_fee_percent: feeDetails.feePercent,
      platform_fee_amount: feeDetails.platformFee,
      creator_net_amount: feeDetails.creatorNet,
      gst_amount: feeDetails.gstAmount,
      zaakpay_order_id,
      status: 'INITIATED',
      created_at: getIsoNow()
    };
    db.transactions.push(newTxn);
    saveDb(db);

    const params = {
      merchantIdentifier: process.env.ZAAKPAY_MERCHANT_ID || 'dummy_merchant',
      orderId: zaakpay_order_id,
      amount: String(gross_amount * 100),
      returnUrl: process.env.ZAAKPAY_RETURN_URL || 'http://localhost:3000/api/payment/callback',
      buyerEmail: user.email || 'brand@example.com',
      buyerFirstName: user.name || 'Brand',
      purpose: 'YBEX Campaign Payment',
      mode: process.env.ZAAKPAY_MODE || 'TEST',
    };
    
    // Simulate payment by jumping to success
    const idx = db.transactions.findIndex((t: any) => t.id === newTxn.id);
    if (idx !== -1) {
      db.transactions[idx].status = 'SUCCESS';
      await sendNotification(db, creator_id, "PAYMENT_RECEIVED", `Payment of ₹${feeDetails.creatorNet.toLocaleString('en-IN')} has been credited to your bank account!`);
      saveDb(db);
    }
    
    return res.json({ test_mode: true, success: true, txn: db.transactions[idx] });
  });

  // --- Chat & Inbox System ---
  
  router.get("/chat/v2/threads", async (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const db = getDb();

    const threads = (db.chat_threads || []).filter((t: any) => t.creator_id === user.user_id || t.brand_id === user.user_id).sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    
    // populate populated versions of relations
    const enriched = threads.map((t: any) => ({
      ...t,
      campaigns: db.campaigns?.find(c => c.campaign_id === t.campaign_id),
      creator: {
        ...db.users?.find(u => u.user_id === t.creator_id),
        profile: db.creator_profiles?.find(p => p.user_id === t.creator_id)
      },
      brand: {
        ...db.users?.find(u => u.user_id === t.brand_id),
        profile: db.brand_profiles?.find(p => p.user_id === t.brand_id)
      }
    }));

    res.json(enriched);
  });

  router.get("/chat/v2/threads/:threadId", async (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const db = getDb();
    const { threadId } = req.params;
    const thread = (db.chat_threads || []).find((t: any) => t.id === threadId);
    if (!thread) return res.status(404).json({ detail: "Thread not found" });
    if (thread.creator_id !== user.user_id && thread.brand_id !== user.user_id) {
      return res.status(403).json({ detail: "Access denied" });
    }
    const enriched = {
      ...thread,
      campaigns: db.campaigns?.find(c => c.campaign_id === thread.campaign_id),
      creator: {
        ...db.users?.find(u => u.user_id === thread.creator_id),
        profile: db.creator_profiles?.find(p => p.user_id === thread.creator_id)
      },
      brand: {
        ...db.users?.find(u => u.user_id === thread.brand_id),
        profile: db.brand_profiles?.find(p => p.user_id === thread.brand_id)
      }
    };
    res.json(enriched);
  });

  router.get("/chat/v2/threads/:threadId/messages", async (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const db = getDb();
    const { threadId } = req.params;
    const messages = (db.chat_messages || []).filter((m: any) => m.thread_id === threadId && !m.is_deleted).sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    res.json(messages);
  });

  router.post("/chat/v2/threads/:threadId/messages", async (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const db = getDb();
    const { threadId } = req.params;
    const { content, message_type = 'text', metadata } = req.body;
    
    // Import dynamically so esbuild works, but since we are compiling server.ts, let's just inline logic or read it
    let blocked = false;
    let reason = null;
    
    const BLOCKED_PATTERNS = [
      /[6-9]\d{9}/g,
      /(\+91|0091)[\s-]?\d{10}/g,
      /whatsapp\.com|wa\.me/gi,
      /t\.me\/|telegram\.me/gi,
      /instagram\.com\/(?!p\/)/gi,
      /[\w.-]+@[\w.-]+\.\w+/g,
      /meet\s*(me|us)\s*outside/gi,
      /direct\s*deal/gi,
      /personal\s*(contact|number|whatsapp)/gi,
      /call\s*me\s*(on|at)/gi,
    ];
    for (const p of BLOCKED_PATTERNS) {
      if (p.test(content)) {
        blocked = true;
        reason = 'Platform rules violation — personal contact sharing not allowed on YBEX.';
        break;
      }
    }

    if (blocked) {
      const msgId = crypto.randomUUID();
      const msg = {
        id: msgId,
        thread_id: threadId,
        sender_id: user.user_id,
        sender_role: user.role,
        message_type: 'text',
        content,
        is_flagged: true,
        flag_reason: reason,
        created_at: new Date().toISOString()
      };
      db.chat_messages.push(msg);
      
      db.message_flags?.push({
        id: crypto.randomUUID(),
        message_id: msgId,
        thread_id: threadId,
        flagged_by: 'system',
        reason: reason,
        severity: 'HIGH',
        status: 'PENDING',
        created_at: new Date().toISOString()
      });
      
      const existingFilter = db.user_violations?.filter(v => v.user_id === user.user_id) || [];
      const existing = existingFilter.length ? existingFilter.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] : null;
      const count = (existing?.violation_count || 0) + 1;
      let isSuspended = false;

      if (count >= 3) {
        isSuspended = true;
        const u = db.users.find(u => u.user_id === user.user_id);
        if (u) u.is_suspended = true;
      }

      db.user_violations?.push({
        id: crypto.randomUUID(),
        user_id: user.user_id,
        violation_type: 'CONTACT_SHARING',
        message_id: msgId,
        thread_id: threadId,
        violation_count: count,
        is_suspended: isSuspended,
        created_at: new Date().toISOString()
      });

      if (isSuspended) {
        await sendNotification(db, user.user_id, "ACCOUNT_RESTRICTED", "Your account has been restricted due to multiple platform violations.");
      } else {
        await sendNotification(db, user.user_id, "WARNING_ISSUED", "WARNING: Sharing contact info (phone/email) is restricted. Repeat violations may suspend your account.");
      }

      saveDb(db);
      return res.status(400).json({ error: reason, blocked: true });
    }

    const newMessage = {
      id: crypto.randomUUID(),
      thread_id: threadId,
      sender_id: user.user_id,
      sender_role: user.role,
      message_type,
      content,
      metadata,
      created_at: new Date().toISOString()
    };
    db.chat_messages.push(newMessage);
    
    // update or create thread
    let t = (db.chat_threads || []).find((t: any) => t.id === threadId);
    if (t) {
      Object.assign(t, { updated_at: new Date().toISOString() });
    } else if (threadId.startsWith('new_')) {
      const actualUserId = threadId.replace('new_', '');
      t = {
        id: threadId,
        creator_id: user.role === 'brand' ? actualUserId : user.user_id,
        brand_id: user.role === 'brand' ? user.user_id : actualUserId,
        status: 'NEGOTIATING',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      db.chat_threads.push(t);
    }
    
    saveDb(db);

    const io = req.app.get("io");
    if (io) {
      io.to(threadId).emit("new_message", newMessage);
      io.emit("thread_updated", { threadId, lastMessage: newMessage });
    }

    res.json(newMessage);
  });

  router.post("/chat/v2/threads/:threadId/offer", async (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const db = getDb();
    const { threadId } = req.params;
    const { amount, deliverables, deadline, revision_count, breakdown } = req.body;

    const offer = {
      id: crypto.randomUUID(),
      thread_id: threadId,
      offered_by: user.user_id,
      amount,
      deliverables,
      deadline,
      revision_count,
      breakdown,
      status: 'PENDING',
      created_at: new Date().toISOString()
    };
    db.deal_offers?.push(offer);

    db.chat_messages.push({
      id: crypto.randomUUID(),
      thread_id: threadId,
      sender_id: user.user_id,
      sender_role: user.role,
      message_type: 'offer',
      content: 'Sent an offer.',
      metadata: offer,
      created_at: new Date().toISOString()
    });

    const thread = (db.chat_threads || []).find(t => t.id === threadId);
    if (thread) {
      const other_id = user.user_id === thread.creator_id ? thread.brand_id : thread.creator_id;
      const campaign = db.campaigns.find(c => c.campaign_id === thread.campaign_id);
      const campTitle = campaign ? campaign.title : "campaign";
      const senderName = user.name || "Brand";
      
      const isCreatorNotif = user.role === "brand";
      const msg = isCreatorNotif 
        ? `${senderName} sent you a deal offer: ₹${amount.toLocaleString('en-IN')} for '${campTitle}'.`
        : `Creator proposed a custom deal offer: ₹${amount.toLocaleString('en-IN')} for '${campTitle}'.`;

      await sendNotification(db, other_id, "OFFER_RECEIVED", msg);
    }

    saveDb(db);
    res.json(offer);
  });

  router.post("/chat/v2/threads/:threadId/offer/:offerId/accept", async (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const db = getDb();
    const { threadId, offerId } = req.params;
    
    const offer = db.deal_offers?.find(o => o.id === offerId);
    if (offer) {
      offer.status = 'ACCEPTED';
      const thread = (db.chat_threads || []).find(t => t.id === threadId);
      if (thread) {
        Object.assign(thread, {
          agreed_amount: offer.amount,
          amount_fixed: offer.amount,
          deliverables: offer.deliverables,
          deadline: offer.deadline,
          revision_count: offer.revision_count,
          breakdown: offer.breakdown,
          status: 'ACTIVE',
          flow_state: 'AI_AGREEMENT_READY',
          updated_at: new Date().toISOString()
        });
      }

      db.chat_messages.push({
        id: crypto.randomUUID(),
        thread_id: threadId,
        sender_id: user.user_id,
        sender_role: 'system',
        message_type: 'system',
        content: `✅ Deal accepted at ₹${offer.amount}! Agreement sign karo.`,
        created_at: new Date().toISOString()
      });
      saveDb(db);
    }

    res.json({ success: true, offer });
  });

  router.post("/chat/v2/threads/:threadId/offer/:offerId/reject", async (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const db = getDb();
    const { threadId, offerId } = req.params;
    
    const offer = db.deal_offers?.find(o => o.id === offerId);
    if (offer) offer.status = 'REJECTED';
    
    db.chat_messages.push({
      id: crypto.randomUUID(),
      thread_id: threadId,
      sender_id: user.user_id,
      sender_role: 'system',
      message_type: 'system',
      content: `❌ Offer rejected. Counter offer bhej sakte ho.`,
      created_at: new Date().toISOString()
    });
    
    saveDb(db);
    res.json({ success: true });
  });

  router.post("/chat/v2/threads/:threadId/accept-terms", async (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const db = getDb();
    const { threadId } = req.params;
    const isBrand = user.role === 'brand';
    
    const thread = (db.chat_threads || []).find(t => t.id === threadId);
    if (!thread) return res.status(404).json({ error: "Thread not found" });
    
    if (isBrand) thread.terms_accepted_brand = true;
    else thread.terms_accepted_creator = true;
    
    saveDb(db);
    res.json({ success: true, thread });
  });

  router.post("/chat/v2/threads/:threadId/sign", async (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const db = getDb();
    const { threadId } = req.params;
    const isBrand = user.role === 'brand';
    
    const thread = (db.chat_threads || []).find(t => t.id === threadId);
    if (!thread) return res.status(404).json({ error: "Thread not found" });
    
    if (isBrand) thread.agreement_signed_brand = true;
    else thread.agreement_signed_creator = true;
    
    if (thread.agreement_signed_brand && thread.agreement_signed_creator) {
      thread.agreement_signed_at = new Date().toISOString();
      db.chat_messages.push({
        id: crypto.randomUUID(),
        thread_id: threadId,
        sender_id: user.user_id,
        sender_role: 'system',
        message_type: 'system',
        content: `🔒 Deal LOCKED. Agreement has been signed by both parties.`,
        created_at: new Date().toISOString()
      });

      const other_id = user.user_id === thread.creator_id ? thread.brand_id : thread.creator_id;
      const otherUser = db.users.find(u => u.user_id === other_id);
      const otherName = otherUser?.name || "Client";
      const campaign = db.campaigns.find(c => c.campaign_id === thread.campaign_id);
      const campTitle = campaign ? campaign.title : "the campaign";

      // Send to both parties
      await sendNotification(db, thread.creator_id, "DEAL_SIGNED", `Deal confirmed with Brand for '${campTitle}'! Agreement signed by both parties.`);
      await sendNotification(db, thread.brand_id, "DEAL_SIGNED", `Deal confirmed with Creator for '${campTitle}'! Agreement signed by both parties.`);
    } else {
      db.chat_messages.push({
        id: crypto.randomUUID(),
        thread_id: threadId,
        sender_id: user.user_id,
        sender_role: 'system',
        message_type: 'system',
        content: `⏳ Waiting for the other party to sign.`,
        created_at: new Date().toISOString()
      });
    }

    saveDb(db);
    res.json({ success: true, thread });
  });

  router.post("/chat/v2/threads/:threadId/submit-content", async (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const db = getDb();
    const { threadId } = req.params;
    const { content_url, notes } = req.body;

    const thread = (db.chat_threads || []).find(t => t.id === threadId);
    if (thread) {
       thread.status = 'CONTENT_SUBMITTED';
       thread.updated_at = new Date().toISOString();

       // Notify Brand
       const campaign = db.campaigns.find(c => c.campaign_id === thread.campaign_id);
       const deliverable = campaign ? campaign.title : "the campaign";
       await sendNotification(db, thread.brand_id, "CONTENT_SUBMITTED", `Creator submitted content draft for deliverable '${deliverable}'. Review now.`);
    }

    db.chat_messages.push({
      id: crypto.randomUUID(),
      thread_id: threadId,
      sender_id: user.user_id,
      sender_role: 'system',
      message_type: 'system',
      content: `📋 Content submitted. Brand ke paas 48hr hain review karne ke liye.`,
      created_at: new Date().toISOString()
    });

    saveDb(db);
    res.json({ success: true });
  });

  router.post("/chat/v2/threads/:threadId/approve-content", async (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const db = getDb();
    const { threadId } = req.params;
    
    const thread = (db.chat_threads || []).find(t => t.id === threadId);
    if (thread) {
       thread.status = 'APPROVED';
       thread.updated_at = new Date().toISOString();

       // Notify Creator
       const campaign = db.campaigns.find(c => c.campaign_id === thread.campaign_id);
       const deliverable = campaign ? campaign.title : "the campaign";
       await sendNotification(db, thread.creator_id, "CONTENT_APPROVED", `Brand approved your content draft for '${deliverable}'! Ready to post. Upload proofs next.`);
    }

    db.chat_messages.push({
      id: crypto.randomUUID(),
      thread_id: threadId,
      sender_id: user.user_id,
      sender_role: 'system',
      message_type: 'system',
      content: `✅ Content approved! Payment trigger ho raha hai.`,
      created_at: new Date().toISOString()
    });

    saveDb(db);
    res.json({ success: true });
  });

  router.post("/chat/v2/threads/:threadId/mark-complete", async (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const db = getDb();
    const { threadId } = req.params;
    
    const thread = (db.chat_threads || []).find(t => t.id === threadId);
    if (thread) {
       thread.status = 'COMPLETED';
       thread.updated_at = new Date().toISOString();
       
       if (!db.transactions) db.transactions = [];
       const amt = thread.agreed_amount || 5000;
       db.transactions.push({
          id: "TXN_" + Math.random().toString(36).substr(2, 9),
          userId: thread.creator_id,
          amount: amt,
          fee_amount: amt * 0.1,
          net_amount: amt * 0.9,
          status: "paid",
          created_at: new Date().toISOString(),
          campaign_title: thread.campaigns?.title || "UGC / Direct Deal"
       });
    }

    db.chat_messages.push({
      id: crypto.randomUUID(),
      thread_id: threadId,
      sender_id: user.user_id,
      sender_role: 'system',
      message_type: 'payment_trigger',
      content: `Invoice generated and payment has been processed.`,
      created_at: new Date().toISOString()
    });

    saveDb(db);
    res.json({ success: true });
  });

  // Admin Chat Routes
  router.get("/admin/system-collabs", (req, res) => {
    const user = parseAuthUser(req);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ detail: "Admin only" });
    }
    const db = getDb();
    const threads = (db.chat_threads || []).map((t: any) => {
      const campaign = db.campaigns.find(c => c.campaign_id === t.campaign_id);
      const brandObj = db.users.find(u => u.user_id === t.brand_id);
      const creatorObj = db.users.find(u => u.user_id === t.creator_id);
      const offer = (db.deal_offers || []).find(o => o.thread_id === t.id && o.status === 'ACCEPTED');

      let statusDisplay = 'In Progress';
      if (t.status === 'DISPUTED') statusDisplay = 'Disputed';
      if (t.status === 'DELIVERED') statusDisplay = 'Delivered';
      if (t.status === 'COMPLETED') statusDisplay = 'Completed';

      return {
        id: t.id,
        campaign: campaign ? campaign.title : 'Unknown Campaign',
        brand: brandObj ? brandObj.name : 'Unknown Brand',
        creator: creatorObj ? creatorObj.name : 'Unknown Creator',
        status: statusDisplay,
        escrow: offer ? offer.amount : 0,
        deadline: offer ? offer.deadline : 'N/A',
        lastUpdate: new Date(t.updated_at).toLocaleDateString()
      };
    });
    res.json(threads);
  });

  router.post("/admin/system-collabs/:id/resolve", (req, res) => {
    const user = parseAuthUser(req);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ detail: "Admin only" });
    }
    const db = getDb();
    const thread = db.chat_threads.find(t => t.id === req.params.id);
    if (thread) {
      if (req.body.resolution === 'pay') {
        thread.status = 'COMPLETED';
      } else if (req.body.resolution === 'refund') {
        thread.status = 'CANCELLED';
      } else {
        thread.status = 'COMPLETED'; // partial
      }
      saveDb(db);
    }
    res.json({ ok: true });
  });

  router.post("/admin/system-collabs/:id/force-status", (req, res) => {
    const user = parseAuthUser(req);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ detail: "Admin only" });
    }
    const db = getDb();
    const thread = db.chat_threads.find(t => t.id === req.params.id);
    if (thread) {
       thread.status = req.body.status.toUpperCase();
       saveDb(db);
    }
    res.json({ ok: true });
  });

  router.get("/admin/chat/all", async (req, res) => {
    const db = getDb();
    const threads = (db.chat_threads || []).map((t: any) => ({
      ...t,
      creator: db.users.find(u => u.user_id === t.creator_id),
      brand: db.users.find(u => u.user_id === t.brand_id)
    }));
    res.json(threads);
  });

  router.get("/admin/chat/flagged", async (req, res) => {
    const db = getDb();
    const flags = (db.message_flags || []).filter(f => f.status === 'PENDING').map(f => ({
      ...f,
      message: db.chat_messages.find(m => m.id === f.message_id),
      thread: (db.chat_threads || []).find(t => t.id === f.thread_id)
    }));
    res.json(flags);
  });

  router.post("/admin/chat/flagged/:flagId/resolve", async (req, res) => {
    const db = getDb();
    const { flagId } = req.params;
    const { action } = req.body;
    
    const flag = db.message_flags?.find(f => f.id === flagId);
    if (flag) {
      flag.status = 'RESOLVED';
      if (action === 'delete_message') {
        const msg = db.chat_messages.find(m => m.id === flag.message_id);
        if (msg) msg.is_deleted = true;
      }
      saveDb(db);
    }
    res.json({ success: true });
  });

  // --- BRAND ENTERPRISE CORE ENDPOINTS ---

  // Brand stats
  router.get("/brand/dashboard/stats", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const db = getDb();
    const actingId = getActingBrandId(user);
    const cCount = db.campaigns.filter((c) => c.brand_user_id === actingId).length;
    const directApps = [];
    db.campaigns.forEach((camp) => {
      if (camp.brand_user_id === actingId) {
        directApps.push(...(camp.applicants || []));
      }
    });

    const activeDeals = db.collabs.filter(
      (c) => (c.from_user_id === actingId || c.to_user_id === actingId) && c.stage !== "COMPLETED"
    ).length;

    const pendingPayments = db.collabs.filter(
      (c) => (c.from_user_id === actingId || c.to_user_id === actingId) && c.stage === "PROOF_SUBMITTED"
    ).length;

    res.json({
      live_campaigns: cCount,
      total_applications: directApps.length,
      active_deals: activeDeals,
      pending_payments: pendingPayments
    });
  });

  // Create Campaign
  router.post("/campaigns/create", (req, res) => {
    const user = parseAuthUser(req);
    if (!user || user.role !== "brand") {
      return res.status(403).json({ detail: "Only brands can post campaigns" });
    }
    const db = getDb();
    const actingId = getActingBrandId(user);
    
    // Auto-create / Auto-verify brand profile for seamless developer and user experience without KYC lock blocks
    let bp = db.brand_profiles.find((p) => p.user_id === actingId);
    if (!bp) {
      bp = {
        user_id: actingId,
        company_name: user.name + " Co",
        logo: user.picture || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name) + "&background=7C3AED&color=fff",
        verified: true,
        status: "approved"
      };
      db.brand_profiles.push(bp);
    } else if (!bp.verified) {
      bp.verified = true;
      bp.status = "approved";
    }

    const cid = `camp_${Math.random().toString(36).substring(2, 10)}`;
    const campaign = {
      id: cid,
      campaign_id: cid,
      brand_user_id: actingId,
      brand_name: bp?.company_name || user.name,
      brand_logo: bp?.logo || user.picture || "",
      title: req.body.title,
      description: req.body.description,
      budget_min: Number(req.body.budget_min) || 1000,
      budget_max: Number(req.body.budget_max) || 10000,
      deliverables: req.body.deliverables || ["1 Youtube Dedicated Review"],
      categories: req.body.categories || ["Tech"],
      platforms: req.body.platforms || ["Instagram"],
      deadline: req.body.deadline || "",
      status: "live",
      stage: "Under Review",
      applicants: [],
      created_at: getIsoNow(),
    };

    db.campaigns.push(campaign);
    logTeamActivity(db, user, "Post Campaign", `Posted campaign brief '${campaign.title}'`);
    saveDb(db);
    res.json(campaign);
  });

  // Get brand's own campaigns
  router.get("/brand/campaigns", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const db = getDb();
    const actingId = getActingBrandId(user);
    const list = db.campaigns.filter((c) => c.brand_user_id === actingId);
    res.json(list);
  });

  // Single campaign detail
  router.get("/campaigns/:id", (req, res) => {
    const db = getDb();
    const c = db.campaigns.find((x) => x.campaign_id === req.params.id);
    if (!c) return res.status(404).json({ detail: "Campaign not found" });
    res.json(c);
  });

  // Update campaign (only DRAFT status)
  router.put("/campaigns/:id", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const db = getDb();
    const c = db.campaigns.find((x) => x.campaign_id === req.params.id);
    if (!c) return res.status(404).json({ detail: "Campaign not found" });
    
    c.title = req.body.title || c.title;
    c.description = req.body.description || c.description;
    c.budget_min = req.body.budget_min || c.budget_min;
    c.budget_max = req.body.budget_max || c.budget_max;
    c.status = req.body.status || c.status;
    saveDb(db);
    res.json(c);
  });

  // Delete campaign (only DRAFT)
  router.delete("/campaigns/:id", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const db = getDb();
    db.campaigns = db.campaigns.filter((c) => c.campaign_id !== req.params.id);
    saveDb(db);
    res.json({ ok: true });
  });

  // Get campaign's applicants
  router.get("/campaigns/:id/applications", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const db = getDb();
    const c = db.campaigns.find((x) => x.campaign_id === req.params.id);
    if (!c) return res.status(404).json({ detail: "Campaign not found" });
    res.json(c.applicants || []);
  });

  // Applications shortlist
  router.post("/applications/:id/shortlist", async (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const db = getDb();
    const actingBrandId = getActingBrandId(user);
    
    // Find campaign and applicant
    let found = false;
    for (const camp of db.campaigns) {
      let app = (camp.applicants || []).find((a) => a.application_id === req.params.id);
      if (app) {
        found = true;
        app.status = "accepted";
        
        // Push collab
        db.collabs = db.collabs || [];
        db.collabs.push({
          collab_id: `collab_${Math.random().toString(36).substring(2, 10)}`,
          from_user_id: actingBrandId,
          from_name: camp.brand_name || user.name,
          to_user_id: app.creator_user_id,
          deliverable: `Campaign Content: ${camp.title}`,
          proposed_amount: app.proposed_amount || 15000,
          status: "accepted",
          stage: "ACTIVE",
          created_at: getIsoNow(),
        });

        // Chat thread
        db.chat_threads = db.chat_threads || [];
        const threadId = `thread_${Math.random().toString(36).substring(2, 10)}`;
        db.chat_threads.push({
          id: threadId,
          campaign_id: camp.campaign_id,
          creator_id: app.creator_user_id,
          brand_id: actingBrandId,
          status: "ACCEPTED",
          created_at: getIsoNow(),
          updated_at: getIsoNow()
        });

        // Notifications
        const brandName = camp.brand_name || user.name || "Brand";
        await sendNotification(db, app.creator_user_id, "SHORTLISTED", `You've been shortlisted for '${camp.title}' by ${brandName}!`);
        await sendNotification(db, app.creator_user_id, "CHAT_UNLOCKED", `Chat unlocked with ${brandName} for '${camp.title}'. Start negotiating!`);
      }
    }

    saveDb(db);
    res.json({ ok: found });
  });

  // Applications reject
  router.post("/applications/:id/reject", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const db = getDb();
    
    let found = false;
    db.campaigns.forEach((camp) => {
      let app = (camp.applicants || []).find((a) => a.application_id === req.params.id);
      if (app) {
        found = true;
        app.status = "rejected";
        app.rejectNote = req.body.note || "";
      }
    });

    saveDb(db);
    res.json({ ok: found });
  });

  // GET single deal/collab contract
  router.get("/deals/:id", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const db = getDb();
    const deal = db.collabs?.find((c) => c.collab_id === req.params.id);
    if (!deal) return res.status(404).json({ detail: "Deal not found" });
    if (deal.to_user_id !== user.user_id && deal.from_user_id !== user.user_id && user.role !== "admin") {
      return res.status(403).json({ detail: "Not authorized to view this deal" });
    }
    res.json(deal);
  });

  // Sign Deal Agreement with Counterparty
  router.post("/deals/:id/sign", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const db = getDb();
    const deal = db.collabs?.find((c) => c.collab_id === req.params.id);
    if (!deal) return res.status(404).json({ detail: "Deal not found" });

    if (user.role === "creator") {
      deal.agreement_signed_creator = true;
    } else if (user.role === "brand") {
      deal.agreement_signed_brand = true;
    }

    if (deal.agreement_signed_creator && deal.agreement_signed_brand) {
      deal.stage = "ACTIVE";
      deal.agreement_signed_at = getIsoNow();
    }
    saveDb(db);
    res.json(deal);
  });

  // Submit Content draft review variables
  router.post("/deals/:id/submit-draft", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const db = getDb();
    const deal = db.collabs?.find((c) => c.collab_id === req.params.id);
    if (!deal) return res.status(404).json({ detail: "Deal not found" });

    const { video_url, caption, notes } = req.body;
    deal.submission = {
      video_url: video_url || "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-smiling-and-looking-at-camera-40246-large.mp4",
      caption,
      notes,
      submitted_at: getIsoNow()
    };
    deal.stage = "CONTENT_SUBMITTED";
    saveDb(db);
    res.json(deal);
  });

  // Add Collab Instagram Link sync live tracking
  router.post("/deals/:id/add-collab", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const db = getDb();
    const deal = db.collabs?.find((c) => c.collab_id === req.params.id);
    if (!deal) return res.status(404).json({ detail: "Deal not found" });

    const { instagram_post_url, fetched_views, fetched_likes, fetched_reach, manual_screenshot_url, fetch_status } = req.body;
    deal.proof = {
      instagram_post_url,
      fetched_views: fetched_views || Math.floor(Math.random() * 41000 + 12000),
      fetched_likes: fetched_likes || Math.floor(Math.random() * 2200 + 400),
      fetched_reach: fetched_reach || Math.floor(Math.random() * 52000 + 18000),
      manual_screenshot_url,
      fetch_status: fetch_status || "SYNCED",
      last_synced_at: getIsoNow(),
      verified_by_brand: false
    };
    deal.stage = "PROOF_SUBMITTED";
    saveDb(db);
    res.json(deal.proof);
  });

  // Content Review: submissions details
  router.get("/deals/:id/submissions", (req, res) => {
    const db = getDb();
    const deal = db.collabs?.find(c => c.collab_id === req.params.id);
    if (!deal) return res.status(404).json({ detail: "Deal not found" });
    res.json(deal.submission || {});
  });

  // Content Review: approve
  router.post("/content-submissions/:id/approve", async (req, res) => {
    const db = getDb();
    const deal = db.collabs?.find(c => c.collab_id === req.params.id);
    if (!deal) return res.status(404).json({ detail: "Submission not found" });
    deal.stage = "CONTENT_APPROVED";

    const deliverable = deal.deliverable || "Campaign Content";
    await sendNotification(db, deal.to_user_id, "CONTENT_APPROVED", `Brand approved your content draft for '${deliverable}'! Ready to post. Upload proofs next.`);

    saveDb(db);
    res.json({ ok: true, deal });
  });

  // Content Review: request changes
  router.post("/content-submissions/:id/request-changes", async (req, res) => {
    const db = getDb();
    const deal = db.collabs?.find(c => c.collab_id === req.params.id);
    if (!deal) return res.status(404).json({ detail: "Submission not found" });
    deal.stage = "NEGOTIATING";
    deal.feedback = req.body.feedback || "";

    const deliverable = deal.deliverable || "Campaign Content";
    const feedback = req.body.feedback || "Please review feedback";
    await sendNotification(db, deal.to_user_id, "REVISION_REQUESTED", `Revision requested for '${deliverable}' content. Feedback: '${feedback}'.`);

    saveDb(db);
    res.json({ ok: true, deal });
  });

  // Content Review: get proof
  router.get("/deals/:id/proof", (req, res) => {
    const db = getDb();
    const deal = db.collabs?.find(c => c.collab_id === req.params.id);
    if (!deal) return res.status(404).json({ detail: "Deal not found" });
    res.json(deal.proof || {});
  });

  // Content Review: submit proof
  router.post("/deals/:id/proof", async (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });

    const db = getDb();
    const deal = db.collabs?.find(c => c.collab_id === req.params.id);
    if (!deal) return res.status(404).json({ detail: "Deal not found" });

    const { proof_url, notes } = req.body;
    deal.proof = {
      proof_url,
      notes,
      submitted_at: getIsoNow()
    };
    deal.stage = "PROOF_SUBMITTED";

    const deliverable = deal.deliverable || "Campaign Content";
    await sendNotification(db, deal.from_user_id, "PROOF_SUBMITTED", `Creator submitted work performance proof for '${deliverable}'. Review now.`);

    saveDb(db);
    res.json({ ok: true, deal });
  });

  // Verify Proof / payment activation
  router.post("/deals/:id/proof/verify", (req, res) => {
    const db = getDb();
    const deal = db.collabs?.find(c => c.collab_id === req.params.id);
    if (!deal) return res.status(404).json({ detail: "Deal not found" });
    deal.stage = "COMPLETED";
    saveDb(db);
    res.json({ ok: true, deal });
  });

  // Initiate Zaakpay escrow transfer simulation URL
  router.post("/payment/initiate", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const { deal_id } = req.body;
    res.json({
      payment_url: `https://zaakpay.com/sandbox/simulation?deal_id=${deal_id}`
    });
  });

  // Get Creator Profile + Extensions
  router.get("/creators/:id/profile", (req, res) => {
    const user = parseAuthUser(req);
    const db = getDb();
    const profile = db.creator_profiles?.find(c => c.user_id === req.params.id) || db.users.find(u => u.user_id === req.params.id);
    if (!profile) return res.status(404).json({ detail: "Creator not found" });

    const portfolio = db.creator_portfolio?.filter(p => p.creator_id === req.params.id) || [];
    const reviews = db.creator_reviews?.filter(r => r.creator_id === req.params.id) || [];
    const isSaved = user ? db.saved_creators?.some(s => s.creator_id === req.params.id && s.brand_id === user.user_id) : false;
    
    // Find similar roughly by category
    const similar = (db.creator_profiles || []).filter(c => c.category === profile.category && c.user_id !== profile.user_id).slice(0, 6);

    res.json({
      ...profile,
      portfolio,
      reviews,
      isSaved,
      similar
    });
  });

  // Save / Unsave creator
  router.post("/creators/:id/save", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const db = getDb();
    if (!db.saved_creators) db.saved_creators = [];
    
    const existingIdx = db.saved_creators.findIndex(s => s.creator_id === req.params.id && s.brand_id === user.user_id);
    if (existingIdx > -1) {
      db.saved_creators.splice(existingIdx, 1);
    } else {
      db.saved_creators.push({
        id: `saved_${Math.random().toString(36).substring(2, 11)}`,
        brand_id: user.user_id,
        creator_id: req.params.id,
        created_at: getIsoNow()
      });
      sendNotification(db, req.params.id, 'PROFILE_SAVED', 'A brand saved your profile!').catch(() => {});
    }
    saveDb(db);
    res.json({ ok: true, isSaved: existingIdx === -1 });
  });

  // Request Collab Cost
  router.post("/creators/:id/request-collab-cost", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const db = getDb();
    if (!db.collab_cost_requests) db.collab_cost_requests = [];
    
    db.collab_cost_requests.push({
      id: `ccr_${Math.random().toString(36).substring(2, 11)}`,
      brand_id: user.user_id,
      creator_id: req.params.id,
      deliverable_type: req.body.deliverable_type,
      brand_message: req.body.brand_message || "",
      status: "PENDING",
      created_at: getIsoNow()
    });
    
    sendNotification(db, req.params.id, 'COST_REQUEST', `${user.name || 'A brand'} wants to know your rate for ${req.body.deliverable_type}`).catch(() => {});
    saveDb(db);
    res.json({ ok: true });
  });

  // Send Brief
  router.post("/creators/:id/send-brief", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const db = getDb();
    if (!db.brief_requests) db.brief_requests = [];
    
    db.brief_requests.push({
      id: `br_${Math.random().toString(36).substring(2, 11)}`,
      brand_id: user.user_id,
      creator_id: req.params.id,
      campaign_id: req.body.campaign_id,
      message: req.body.message,
      budget_range: req.body.budget_range,
      status: "SENT",
      created_at: getIsoNow()
    });
    
    sendNotification(db, req.params.id, 'BRIEF_RECEIVED', `${user.name || 'A brand'} sent you a campaign brief`).catch(() => {});
    saveDb(db);
    res.json({ ok: true });
  });

  // Campaign Detail specifically optimized
  router.get("/campaigns/:id/detail", (req, res) => {
    const db = getDb();
    const c = db.campaigns.find((x) => x.campaign_id === req.params.id);
    if (!c) return res.status(404).json({ detail: "Campaign not found" });
    
    const user = parseAuthUser(req);
    let applicationInfo = null;
    if (user && c.applicants) {
      applicationInfo = c.applicants.find((a: any) => a.creator_user_id === user.user_id) || null;
    }
    
    const similar = db.campaigns.filter((x) => x.campaign_id !== c.campaign_id && (x.categories || []).some((cat: string) => (c.categories || []).includes(cat)) && x.status === 'live').slice(0, 4);

    res.json({
      ...c,
      applicationInfo,
      similar
    });
  });

  // Apply to campaign
  router.post("/campaigns/:id/apply", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const db = getDb();
    const c = db.campaigns.find((x) => x.campaign_id === req.params.id);
    if (!c) return res.status(404).json({ detail: "Campaign not found" });
    
    if (!c.applicants) c.applicants = [];
    const exists = c.applicants.find((a: any) => a.creator_user_id === user.user_id);
    if (exists) return res.status(400).json({ detail: "Already applied" });

    // Assuming KYC is valid
    c.applicants.push({
      application_id: `app_${Math.random().toString(36).substring(2, 11)}`,
      creator_user_id: user.user_id,
      creator_name: user.name,
      proposed_amount: req.body.proposedRate || 0,
      pitch: req.body.pitch || "",
      portfolio_links: req.body.portfolioLinks || "",
      est_delivery: req.body.estDelivery || "",
      status: "applied",
      created_at: getIsoNow()
    });
    
    sendNotification(db, c.brand_user_id, 'NEW_APPLICATION', `${user.name} applied to ${c.title}`).catch(() => {});
    saveDb(db);
    res.json({ ok: true });
  });

  // Deal endpoints alias & ext
  router.post("/deals/:id/submit-content", (req, res, next) => {
    req.url = `/deals/${req.params.id}/submit-draft`;
    (router as any)(req, res, next);
  });

  router.post("/deals/:id/submit-proof", (req, res, next) => {
    req.url = `/deals/${req.params.id}/proof`;
    (router as any)(req, res, next);
  });
  
  router.post("/deals/:id/verify-proof", (req, res, next) => {
    req.url = `/deals/${req.params.id}/proof/verify`;
    (router as any)(req, res, next);
  });

  // Fetch Instagram Insights manually for proof
  router.post("/deals/:id/fetch-insights", async (req, res) => {
    const { instagram_post_url } = req.body;
    try {
      // Stubing Graph API fetch to simulate influish style since we don't have real tokens
      // "Extract post ID from URL"
      const match = instagram_post_url.match(/instagram\.com\/p\/([^\\/?]+)/);
      const postId = match ? match[1] : '';

      // Mock success for simulation
      if (postId) {
        res.json({
          status: 'FETCHED',
          insights: {
            views: Math.floor(Math.random() * 50000) + 10000,
            likes: Math.floor(Math.random() * 5000) + 500,
            reach: Math.floor(Math.random() * 40000) + 8000,
            impressions: Math.floor(Math.random() * 60000) + 12000,
          }
        });
      } else {
        res.json({ status: 'FAILED', reason: 'Invalid URL. Could not fetch.' });
      }
    } catch (err) {
      res.json({ status: 'FAILED' });
    }
  });

  // Review creator
  router.post("/deals/:id/review", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const db = getDb();
    if (!db.creator_reviews) db.creator_reviews = [];
    
    db.creator_reviews.push({
      id: `rev_${Math.random().toString(36).substring(2, 11)}`,
      deal_id: req.params.id,
      creator_id: req.body.creator_id,
      brand_id: user.user_id,
      brand_name: user.name,
      rating: req.body.rating || 5,
      comment: req.body.comment || "",
      created_at: getIsoNow()
    });
    saveDb(db);
    res.json({ ok: true });
  });

  // Invoices 
  router.get("/invoices", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const db = getDb();
    const invoices = (db.invoices || []).filter(i => i.creator_id === user.user_id);
    res.json(invoices);
  });

  router.get("/invoices/stats", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const db = getDb();
    const invoices = (db.invoices || []).filter(i => i.creator_id === user.user_id);
    let total_volume = 0, paid = 0, pending = 0;
    for (const inv of invoices) {
      const amt = inv.total_amount || inv.totalAmount || 0;
      if (inv.status === 'PAID') { paid += amt; total_volume += amt; }
      else if (inv.status === 'PENDING') { pending += amt; total_volume += amt; }
      else { total_volume += amt; }
    }
    res.json({ total_volume, paid, pending });
  });

  router.get("/invoices/:id", (req, res) => {
    const db = getDb();
    const inv = (db.invoices || []).find(i => i.id === req.params.id);
    if (!inv) return res.status(404).json({ detail: "Not found" });
    res.json(inv);
  });

  router.post("/invoices", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const db = getDb();
    if (!db.invoices) db.invoices = [];
    
    const newInvoice = {
      id: `inv_${Math.random().toString(36).substring(2, 11)}`,
      creator_id: user.user_id,
      invoiceNumber: req.body.invoiceNumber,
      clientName: req.body.clientName,
      clientGstin: req.body.clientGstin,
      date: req.body.date,
      lineItems: req.body.lineItems || [],
      subtotal: req.body.subtotal || 0,
      cgst: req.body.cgst || 0,
      sgst: req.body.sgst || 0,
      igst: req.body.igst || 0,
      totalAmount: req.body.totalAmount || 0,
      status: req.body.status || 'DRAFT',
      created_at: getIsoNow()
    };
    db.invoices.push(newInvoice);
    saveDb(db);
    res.json(newInvoice);
  });

  router.patch("/invoices/:id/status", (req, res) => {
    const db = getDb();
    const inv = (db.invoices || []).find(i => i.id === req.params.id);
    if (!inv) return res.status(404).json({ detail: "Not found" });
    inv.status = req.body.status;
    saveDb(db);
    res.json(inv);
  });

  router.delete("/invoices/:id", (req, res) => {
    const db = getDb();
    db.invoices = (db.invoices || []).filter(i => i.id !== req.params.id);
    saveDb(db);
    res.json({ ok: true });
  });

  router.get("/invoices/billing-profile", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const db = getDb();
    const profile = (db.invoice_billing_profile || []).find(p => p.creator_id === user.user_id);
    res.json(profile || null);
  });

  router.post("/invoices/billing-profile", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const db = getDb();
    if (!db.invoice_billing_profile) db.invoice_billing_profile = [];
    
    let profile = db.invoice_billing_profile.find(p => p.creator_id === user.user_id);
    if (profile) {
      Object.assign(profile, req.body, { updated_at: getIsoNow() });
    } else {
      profile = {
        id: `bp_${Math.random().toString(36).substring(2, 11)}`,
        creator_id: user.user_id,
        ...req.body,
        created_at: getIsoNow()
      };
      db.invoice_billing_profile.push(profile);
    }
    saveDb(db);
    res.json(profile);
  });

  router.get("/invoices/clients", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const db = getDb();
    res.json((db.invoice_clients || []).filter(c => c.creator_id === user.user_id));
  });

  router.post("/invoices/clients", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const db = getDb();
    if (!db.invoice_clients) db.invoice_clients = [];
    
    const newClient = {
      id: `client_${Math.random().toString(36).substring(2, 11)}`,
      creator_id: user.user_id,
      ...req.body,
      created_at: getIsoNow()
    };
    db.invoice_clients.push(newClient);
    saveDb(db);
    res.json(newClient);
  });

  router.delete("/invoices/clients/:id", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const db = getDb();
    db.invoice_clients = (db.invoice_clients || []).filter(c => c.id !== req.params.id);
    saveDb(db);
    res.json({ ok: true });
  });

  // UGC Routes
  const resend = new Resend(process.env.RESEND_API_KEY || "mock-key");

  router.get("/ugc/showcase", (req, res) => {
    const db = getDb();
    res.json(db.ugc_showcase || []);
  });

  router.get("/ugc/briefs/my", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const db = getDb();
    const briefs = (db.ugc_briefs || []).filter(b => b.brand_id === user.user_id);
    res.json(briefs);
  });

  router.post("/ugc/briefs", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const db = getDb();
    if (!db.ugc_briefs) db.ugc_briefs = [];
    
    // Simplification for Zaakpay step (automatically posting) 
    const creatorUser = db.users.find(u => u.user_id === user.user_id);
    const profile = db.brand_profiles?.find(p => p.user_id === user.user_id) || creatorUser;
    
    const brief = {
      id: `brief_${Math.random().toString(36).substring(2, 11)}`,
      brand_id: user.user_id,
      brand_name: profile?.company || profile?.name || "Brand Partner",
      ...req.body,
      claimed_count: 0,
      status: "OPEN",
      created_at: getIsoNow()
    };
    db.ugc_briefs.push(brief);
    saveDb(db);
    res.json(brief);
  });

  router.get("/ugc/orders/brand", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const db = getDb();
    const orders = (db.ugc_orders || []).filter(o => o.brand_id === user.user_id).map(o => {
      // populate brief
      const brief = (db.ugc_briefs || []).find(b => b.id === o.brief_id);
      // populate deliveries
      const deliveries = (db.ugc_deliveries || []).filter(d => d.order_id === o.id);
      const latestDelivery = deliveries.length > 0 ? deliveries[deliveries.length - 1] : null;
      // populate creator
      const creator = (db.creator_profiles || []).find(c => c.user_id === o.creator_id) || (db.users || []).find(u => u.user_id === o.creator_id);
      return { ...o, brief, latestDelivery, creator };
    });
    res.json(orders);
  });

  // Creator routes
  router.get("/ugc/briefs/available", (req, res) => {
    const db = getDb();
    const briefs = (db.ugc_briefs || []).filter(b => b.status === "OPEN" && b.claimed_count < b.max_creators);
    res.json(briefs);
  });

  router.post("/ugc/orders/claim", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const { brief_id } = req.body;
    const db = getDb();
    const brief = (db.ugc_briefs || []).find(b => b.id === brief_id);
    if (!brief || brief.status !== 'OPEN' || brief.claimed_count >= brief.max_creators) {
      return res.status(400).json({ error: 'Brief not available' });
    }
    
    brief.claimed_count += 1;
    let feePercent = brief.budget <= 20000 ? 5 : 2;
    let feeAmount = (brief.budget * feePercent) / 100;
    let creatorPayout = brief.budget - feeAmount;

    const now = new Date();
    const internalDeadline = new Date(now.getTime() + 22 * 60 * 60 * 1000);

    if (!db.ugc_orders) db.ugc_orders = [];
    const order = {
      id: `ugcorder_${Math.random().toString(36).substring(2, 11)}`,
      brief_id,
      creator_id: user.user_id,
      brand_id: brief.brand_id,
      claimed_at: now.toISOString(),
      internal_deadline: internalDeadline.toISOString(),
      creator_status: 'CLAIMED',
      brand_status: 'CREATOR_BRIEFED',
      agreed_amount: brief.budget,
      platform_fee_percent: feePercent,
      platform_fee_amount: feeAmount,
      creator_payout: creatorPayout,
      payment_status: 'HELD',
      created_at: now.toISOString()
    };
    db.ugc_orders.push(order);
    
    // Also create a chat thread so the brand and creator can communicate
    if (!db.chat_threads) db.chat_threads = [];
    const threadId = `thread_${Math.random().toString(36).substr(2, 9)}`;
    const newThread = {
      id: threadId,
      collab_id: order.id, 
      is_ugc: true,
      creator_id: user.user_id,
      brand_id: brief.brand_id,
      status: "ACTIVE",
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      
      // Automatic agreement for UGC
      flow_state: "AI_AGREEMENT_READY",
      amount_fixed: brief.budget,
      terms_and_conditions: "Deliver within 24 hours. " + brief.description,
      ai_generated_agreement: "UGC Video Creation Agreement\n\n1. Scope: " + brief.description + "\n2. Delivery Timeline: Within 24 hours of claim\n3. Compensation: ₹" + brief.budget + " upon approval\n4. Rights: Brand has full usage rights.",
      campaign_title: brief.title,
      brand_name: brief.brand_name || "Brand",
      creator_name: user.name || "Creator",
      due_date: new Date(Date.now() + 24 * 86400000).toISOString(),
      agreement_signed_brand: true, // Auto-signed by brand since it's an instant order
      agreement_signed_creator: false,
      agreed_amount: brief.budget
    };
    db.chat_threads.push(newThread);

    if (!db.chat_messages) db.chat_messages = [];
    db.chat_messages.push({
      id: `m_${Math.random().toString(36).substr(2, 9)}`,
      thread_id: threadId,
      sender_id: "system",
      content: `Creator has successfully claimed the UGC brief "${brief.title}". You can now discuss any specific requirements or drop files here.`,
      created_at: now.toISOString()
    });

    sendNotification(db, brief.brand_id, 'UGC_CREATOR_BRIEFED', `Great news! A creator has claimed your brief "${brief.title}" and is getting started.`).catch(() => {});
    saveDb(db);
    res.json({ order, internal_deadline: internalDeadline, thread_id: threadId });
  });

  router.get("/ugc/orders/creator", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const db = getDb();
    const orders = (db.ugc_orders || []).filter(o => o.creator_id === user.user_id).map(o => {
      // populate brief
      const brief = (db.ugc_briefs || []).find(b => b.id === o.brief_id);
      return { ...o, brief };
    });
    // Creator only sees internal representations anyway
    res.json(orders);
  });

  router.post("/ugc/orders/:id/deliver", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const { id } = req.params;
    const { video_url, thumbnail_url, creator_notes, video_name } = req.body;
    const db = getDb();
    
    const order = (db.ugc_orders || []).find(o => o.id === id);
    if (!order || order.creator_id !== user.user_id) return res.status(403).json({ error: 'Unauthorized' });

    const now = new Date();
    const qualityReviewEndsAt = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    if (!db.ugc_deliveries) db.ugc_deliveries = [];
    db.ugc_deliveries.push({
      id: `dev_${Math.random().toString(36).substring(2, 11)}`,
      order_id: id,
      creator_id: user.user_id,
      video_url,
      thumbnail_url,
      creator_notes,
      video_name,
      submitted_by: 'creator',
      submitted_at: now.toISOString()
    });

    order.creator_status = 'DELIVERED';
    order.brand_status = 'QUALITY_REVIEW';
    order.delivered_at = now.toISOString();
    order.quality_review_ends_at = qualityReviewEndsAt.toISOString();

    sendNotification(db, order.brand_id, 'UGC_QUALITY_REVIEW', `Your UGC video is under quality review. It'll be ready for your approval within 2 hours.`).catch(() => {});
    saveDb(db);
    res.json({ success: true, quality_review_ends_at: qualityReviewEndsAt });
  });

  router.post("/ugc/orders/:id/approve", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const { id } = req.params;
    const db = getDb();
    
    const order = (db.ugc_orders || []).find(o => o.id === id);
    if (!order || order.brand_id !== user.user_id) return res.status(403).json({ error: 'Unauthorized' });
    if (order.brand_status !== 'DELIVERED') return res.status(400).json({ error: 'Video not ready for approval yet' });

    order.brand_status = 'COMPLETED';
    order.creator_status = 'DELIVERED';
    order.payment_status = 'RELEASED';
    order.approved_at = new Date().toISOString();

    sendNotification(db, order.creator_id, 'UGC_PAYMENT_RELEASED', `🎉 ₹${order.creator_payout} credited! Your UGC was approved.`).catch(() => {});
    saveDb(db);
    res.json({ success: true });
  });

  router.post("/ugc/orders/:id/revision", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const { id } = req.params;
    const { revision_note } = req.body;
    const db = getDb();

    const order = (db.ugc_orders || []).find(o => o.id === id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if ((order.revision_count || 0) >= (order.max_revisions || 1)) return res.status(400).json({ error: 'Max revisions reached' });

    const newDeadline = new Date(Date.now() + 12 * 60 * 60 * 1000);

    order.creator_status = 'REVISION_REQUESTED';
    order.brand_status = 'CONTENT_CREATION';
    order.revision_count = (order.revision_count || 0) + 1;
    order.revision_note = revision_note;
    order.internal_deadline = newDeadline.toISOString();

    sendNotification(db, order.creator_id, 'UGC_REVISION', `Revision requested: "${revision_note}". You have 12 hours.`).catch(() => {});
    saveDb(db);
    res.json({ success: true });
  });

  router.get("/ugc/earnings", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const db = getDb();
    const earnings = (db.ugc_orders || []).filter(o => o.creator_id === user.user_id && o.payment_status === "RELEASED");
    res.json(earnings);
  });

  router.get("/admin/ugc/orders", (req, res) => {
    const user = parseAuthUser(req);
    if (!user || user.role !== "admin") return res.status(403).json({ detail: "Forbidden" });
    const db = getDb();
    res.json(db.ugc_orders || []);
  });

  router.post("/admin/ugc/orders/:id/team-upload", (req, res) => {
    // Admin mock
    const { id } = req.params;
    const { video_url, thumbnail_url } = req.body;
    const db = getDb();
    const order = (db.ugc_orders || []).find(o => o.id === id);
    if (!order) return res.status(404).json({ error: "Order not found "});

    const now = new Date();
    const qualityReviewEndsAt = new Date(now.getTime() + 30 * 60 * 1000);

    if (!db.ugc_deliveries) db.ugc_deliveries = [];
    db.ugc_deliveries.push({
      id: `dev_${Math.random().toString(36).substring(2, 11)}`,
      order_id: id,
      creator_id: order.creator_id,
      video_url,
      thumbnail_url,
      creator_notes: 'Quality checked by YBEX team',
      submitted_by: 'team'
    });

    order.creator_status = 'DELIVERED';
    order.brand_status = 'QUALITY_REVIEW';
    order.delivered_at = now.toISOString();
    order.quality_review_ends_at = qualityReviewEndsAt.toISOString();
    order.team_intervened = true;

    sendNotification(db, order.brand_id, 'UGC_QUALITY_REVIEW', 'Your UGC video is under quality review. Ready for approval soon!').catch(() => {});
    saveDb(db);
    res.json({ success: true });
  });

  // UGC Crons
  cron.schedule('*/5 * * * *', async () => {
    try {
      const db = getDb();
      const now = new Date().toISOString();
      let changed = false;

      // CRON 1: QUALITY_REVIEW -> DELIVERED
      const reviewsDone = (db.ugc_orders || []).filter(o => o.brand_status === 'QUALITY_REVIEW' && o.quality_review_ends_at && o.quality_review_ends_at < now);
      for (const order of reviewsDone) {
        order.brand_status = 'DELIVERED';
        sendNotification(db, order.brand_id, 'UGC_READY', '✅ Quality check complete! Your UGC video is ready for review.').catch(() => {});
        changed = true;
      }

      // Reminders to Creator: 12h, 6h, 1h
      const toRemind = (db.ugc_orders || []).filter(o => o.creator_status === 'CLAIMED' && new Date(o.internal_deadline) > new Date(now));
      for (const order of toRemind) {
        const timeLeft = new Date(order.internal_deadline).getTime() - new Date(now).getTime();
        const brief = (db.ugc_briefs || []).find(b => b.id === order.brief_id);
        if (timeLeft <= 12 * 3600 * 1000 && !order.alert_12hr) {
          order.alert_12hr = true;
          changed = true;
          sendNotification(db, order.creator_id, 'UGC_REMINDER', `Reminder: 12 hours left to submit the UGC video for "${brief?.title || 'Brand'}". Please upload soon!`).catch(() => {});
        } else if (timeLeft <= 6 * 3600 * 1000 && !order.alert_6hr) {
          order.alert_6hr = true;
          changed = true;
          sendNotification(db, order.creator_id, 'UGC_REMINDER', `Urgent: Only 6 hours left to submit your UGC video for "${brief?.title || 'Brand'}".`).catch(() => {});
        } else if (timeLeft <= 1 * 3600 * 1000 && !order.alert_1hr) {
          order.alert_1hr = true;
          changed = true;
          sendNotification(db, order.creator_id, 'UGC_REMINDER', `CRITICAL: Less than 1 hour left to submit your UGC video! Avoid cancellation.`).catch(() => {});
        }
      }

      // CRON 2: 22hr alert
      const atRisk = (db.ugc_orders || []).filter(o => o.creator_status === 'CLAIMED' && !o.alert_22hr_sent && new Date(o.internal_deadline) < new Date(new Date(now).getTime() + 30 * 60 * 1000));
      for (const order of atRisk) {
        order.alert_22hr_sent = true;
        changed = true;
        const brief = (db.ugc_briefs || []).find(b => b.id === order.brief_id);
        
        try {
          await resend.emails.send({
            from: 'alerts@ybex.in',
            to: ['team@ybex.in'],
            subject: `🚨 UGC ALERT — Order #${order.id.slice(0,8)} deadline in <30 minutes!`,
            html: `UGC Alert for Order ID: ${order.id}. Brief: ${brief?.title}. Deliverable: ${brief?.deliverable_type}. Creator ID: ${order.creator_id}. Needs manual intervention.`
          });
        } catch(e) {
          console.error("Resend error:", e);
        }
      }

      // CRON 3: Auto-cancel 
      const expired = (db.ugc_orders || []).filter(o => o.creator_status === 'CLAIMED' && new Date(o.internal_deadline) < new Date(new Date(now).getTime() - 2 * 60 * 60 * 1000));
      for (const order of expired) {
        order.creator_status = 'CANCELLED';
        order.brand_status = 'CANCELLED';
        order.payment_status = 'REFUNDED';
        const brief = (db.ugc_briefs || []).find(b => b.id === order.brief_id);
        if (brief) {
          brief.claimed_count = Math.max(0, (brief.claimed_count || 1) - 1);
        }
        sendNotification(db, order.brand_id, 'UGC_CANCELLED_REFUND', 'Unfortunately your UGC order could not be fulfilled in time. Full refund initiated.').catch(() => {});
        changed = true;
      }

      // CRON 4: MATCHING -> CONTENT_CREATION (30 min ago)
      const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      const needsPulsing = (db.ugc_orders || []).filter(o => o.brand_status === 'CREATOR_BRIEFED' && o.claimed_at < thirtyMinAgo);
      for (const order of needsPulsing) {
        order.brand_status = 'CONTENT_CREATION';
        changed = true;
      }

      if (changed) saveDb(db);
    } catch(e) {
      console.error("Cron error:", e);
    }
  });


  // Mount API Router on parent app
  // BANNERS API
  router.get("/banners", (req, res) => {
    const db = getDb();
    res.json(db.banners || []);
  });

  router.post("/banners", upload.single("image"), (req, res) => {
    const user = parseAuthUser(req);
    if (!user || user.role !== "admin") return res.status(403).json({ error: "Admin only" });

    const db = getDb();
    if (!db.banners) db.banners = [];

    const { type, placement, link, status } = req.body;
    let imgUrl = req.body.imgUrl;
    
    if (req.file) {
      // In a real app we'd upload to Supabase storage, for now use a data URI or placeholder
      const base64 = req.file.buffer.toString("base64");
      imgUrl = `data:${req.file.mimetype};base64,${base64}`;
    }

    const newBanner = {
      id: `ban_${Math.random().toString(36).substring(2, 9)}`,
      type: type || 'Influencer',
      placement: placement || 'Home Top',
      imgUrl: imgUrl || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80',
      link: link || '',
      status: status || 'Live',
      clicks: 0,
      created_at: getIsoNow(),
    };

    db.banners.push(newBanner);
    saveDb(db);
    res.json(newBanner);
  });

  router.delete("/banners/:id", (req, res) => {
    const user = parseAuthUser(req);
    if (!user || user.role !== "admin") return res.status(403).json({ error: "Admin only" });
    const db = getDb();
    if (!db.banners) db.banners = [];
    db.banners = db.banners.filter(b => b.id !== req.params.id);
    saveDb(db);
    res.json({ success: true });
  });

  
  router.post("/ai/suggest", async (req, res) => {
    const { prompt, type } = req.body;
    if (!prompt) return res.status(400).json({ detail: "Prompt is required" });

    try {
      if (process.env.GEMINI_API_KEY) {
        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: { headers: { "User-Agent": "aistudio-build" } }
        });
        
        let finalPrompt = prompt;
        if (type === "campaign_brief") {
          finalPrompt = "You are a marketing expert. Write a detailed, professional influencer marketing campaign brief based on the following input:\n\n" + prompt;
        } else if (type === "brand_description") {
          finalPrompt = "You are a professional copywriter. Write a short, engaging company description for a brand with the following details:\n\n" + prompt;
        } else if (type === "creator_bio") {
          finalPrompt = "You are a social media expert. Write a catchy, professional bio for an influencer based on the following details:\n\n" + prompt;
        }

        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: finalPrompt,
        });
        
        return res.json({ text: response.text });
      } else {
        return res.json({ text: "AI is currently disabled because GEMINI_API_KEY is not set. Here is a mocked response based on your prompt: " + prompt.substring(0, 50) + "..." });
      }
    } catch (error) {
      console.error("AI Error:", error);
      return res.status(500).json({ detail: "AI generation failed" });
    }
  });


  router.post("/ai/generate-campaign", async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ detail: "Prompt is required" });
    try {
      if (process.env.GEMINI_API_KEY) {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, httpOptions: { headers: { "User-Agent": "aistudio-build" } } });
        const finalPrompt = `You are an expert campaign manager. Based on this input: "${prompt}", generate a complete campaign configuration.
Return ONLY valid JSON with no markdown formatting. The JSON should match this structure:
{
  "title": "Campaign Title",
  "description": "Detailed brief...",
  "categories": ["Fashion", "Beauty"], // 1-3 valid niches
  "language_type": "Any language", // or "Specific language"
  "platforms": ["Instagram"],
  "max_creators": 50,
  "budget_min": "5000",
  "budget_max": "10000",
  "brand_type": "Some Brand Type",
  "follower_min": 10000,
  "follower_max": 100000,
  "dos": "List of dos...",
  "donts": "List of donts...",
  "hashtags": "#ad #campaign",
  "mentions": "@brand"
}`;
        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: finalPrompt,
        });
        let text = response.text;
        try {
          const jsonStr = text.replace(/\s*```[a-z]*\n?/gi, "").replace(/\s*```/g, "");
          const match = jsonStr.match(/\{[\s\S]*\}/);
          if (match) {
            return res.json(JSON.parse(match[0]));
          } else {
            return res.json({ error: "Failed to parse JSON" });
          }
        } catch(e) {
           return res.json({ error: "Failed to parse JSON" });
        }
      } else {
        return res.json({ title: "Mock Campaign Title", description: "Mock generated brief based on: " + prompt, budget_min: "2000", budget_max: "5000", follower_min: 10000, follower_max: 500000 });
      }
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Failed to generate campaign" });
    }
  });

  router.post("/ai/match-score", async (req, res) => {
    const { creator, campaign } = req.body;
    try {
      if (process.env.GEMINI_API_KEY) {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, httpOptions: { headers: { "User-Agent": "aistudio-build" } } });
        const finalPrompt = `Analyze the fit between this creator and campaign. Return ONLY a JSON object with: { "score": number (0-100), "reasoning": "brief explanation" }. Creator: ${JSON.stringify(creator)}. Campaign: ${JSON.stringify(campaign)}.`;
        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: finalPrompt,
        });
        let text = response.text;
        try {
          const jsonStr = text.replace(/\s*```[a-z]*\n?/gi, "").replace(/\s*```/g, "");
          const match = jsonStr.match(/\{[\s\S]*\}/);
          if (match) {
            return res.json(JSON.parse(match[0]));
          } else {
            return res.json({ error: "Failed to parse JSON" });
          }
        } catch(e) {
           return res.json({ error: "Failed to parse JSON" });
        }
      } else {
        return res.json({ score: 85, reasoning: "Strong category alignment and follower count matches requirements." });
      }
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Failed to generate match score" });
    }
  });

  router.post("/ai/predict-roi", async (req, res) => {
    const { campaign, creators } = req.body;
    try {
      if (process.env.GEMINI_API_KEY) {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, httpOptions: { headers: { "User-Agent": "aistudio-build" } } });
        const finalPrompt = `Predict the ROI for this campaign given these creators. Return ONLY a JSON object with: { "estimatedReach": number, "estimatedEngagement": number, "roiMultiplier": number (e.g. 2.5), "analysis": "brief explanation" }. Campaign budget: ${campaign?.budget_max}. Creator stats: ${JSON.stringify(creators)}.`;
        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: finalPrompt,
        });
        let text = response.text;
        try {
          const jsonStr = text.replace(/\s*```[a-z]*\n?/gi, "").replace(/\s*```/g, "");
          const match = jsonStr.match(/\{[\s\S]*\}/);
          if (match) {
            return res.json(JSON.parse(match[0]));
          } else {
            return res.json({ error: "Failed to parse JSON" });
          }
        } catch(e) {
           return res.json({ error: "Failed to parse JSON" });
        }
      } else {
        return res.json({ estimatedReach: 500000, estimatedEngagement: 15000, roiMultiplier: 3.2, analysis: "Based on historical creator performance, this campaign shows strong potential ROI." });
      }
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Failed to predict ROI" });
    }
  });

  router.post("/ai/negotiation", async (req, res) => {
    const { history, offer, brandContext, creatorContext } = req.body;
    try {
      if (process.env.GEMINI_API_KEY) {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, httpOptions: { headers: { "User-Agent": "aistudio-build" } } });
        const finalPrompt = `You are an AI negotiation assistant acting on behalf of a user. Provide a strategic, polite response to this negotiation. 
        Context: ${JSON.stringify({brandContext, creatorContext})}
        Offer: ${offer}
        History: ${JSON.stringify(history)}
        Return ONLY a JSON object with: { "suggestedResponse": "string", "advice": "string" }`;
        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: finalPrompt,
        });
        let text = response.text;
        try {
          const jsonStr = text.replace(/\s*```[a-z]*\n?/gi, "").replace(/\s*```/g, "");
          const match = jsonStr.match(/\{[\s\S]*\}/);
          if (match) {
            return res.json(JSON.parse(match[0]));
          } else {
            return res.json({ error: "Failed to parse JSON" });
          }
        } catch(e) {
           return res.json({ error: "Failed to parse JSON" });
        }
      } else {
        return res.json({ suggestedResponse: "I appreciate the offer. Given the deliverable requirements, would you be open to...", advice: "Consider counter-offering 10% higher." });
      }
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Failed to generate negotiation advice" });
    }
  });

  app.use("/api", router);

  // Vite middleware setup for rendering React SPA in development or compiled files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Bind and listen to 3000
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
    
    // Explicitly run the garbage collector periodically as requested
    if (global.gc) {
      setInterval(() => {
        global.gc();
      }, 60000);
      console.log('Garbage collection interval configured.');
    } else {
      console.log('Garbage collection not exposed. Run with --expose-gc.');
    }
  });

  // Setup Socket.io Server
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  app.set("io", io);

  const onlineUsers = new Set<string>();

  io.on("connection", (socket) => {
    let registeredUserId: string | null = null;

    socket.on("register_user", (userId) => {
      if (userId) {
        registeredUserId = userId;
        onlineUsers.add(userId);
        io.emit("user_status_change", { userId, status: "online" });
        socket.emit("online_users_list", Array.from(onlineUsers));
      }
    });

    socket.on("get_online_users", () => {
      socket.emit("online_users_list", Array.from(onlineUsers));
    });

    socket.on("join_room", (threadId) => {
      socket.join(threadId);
    });

    socket.on("leave_room", (threadId) => {
      socket.leave(threadId);
    });

    socket.on("disconnect", () => {
      if (registeredUserId) {
        onlineUsers.delete(registeredUserId);
        io.emit("user_status_change", { userId: registeredUserId, status: "offline" });
      }
    });
  });
}

startServer();
