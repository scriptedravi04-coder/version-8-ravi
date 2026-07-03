CREATE TABLE IF NOT EXISTS public.ybex_sync (
    id INT PRIMARY KEY,
    state JSONB
);

ALTER TABLE public.ybex_sync ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON public.ybex_sync FOR ALL USING (true);
