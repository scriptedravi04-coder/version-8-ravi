const fs = require("fs");
let path = "src/pages/brand/BrandCampaignApplicants.jsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
  "import { ArrowLeft, Megaphone, Users, HelpCircle, Check, Sparkles } from \"lucide-react\";",
  "import { ArrowLeft, Megaphone, Users, HelpCircle, Check, Sparkles, Loader2 } from \"lucide-react\";"
);

content = content.replace(
  "const [loading, setLoading] = useState(true);",
  "const [loading, setLoading] = useState(true);\n  const [aiRoi, setAiRoi] = useState(null);\n  const [isPredictingRoi, setIsPredictingRoi] = useState(false);\n\n  const handlePredictRoi = async () => {\n    setIsPredictingRoi(true);\n    try {\n      const { data } = await api.post(\"/ai/predict-roi\", { campaign, creators: applicants });\n      setAiRoi(data);\n    } catch (e) {\n      toast.error(\"Failed to predict ROI\");\n    } finally {\n      setIsPredictingRoi(false);\n    }\n  };"
);

const predictiveRoiHtml = `

      <div className="mt-6 mb-8 pt-6 border-t border-[var(--border-default)]">
        <h4 className="font-bold text-sm text-[var(--text-primary)] mb-3 flex items-center gap-2">
          <Sparkles size={16} className="text-[var(--violet)]" />
          Predictive AI ROI
        </h4>
        {aiRoi ? (
          <div className="bg-[var(--bg-elevated)] p-4 rounded-xl border border-[var(--border-default)]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-[var(--text-secondary)]">Est. Reach</span>
              <span className="text-sm font-bold text-[var(--text-primary)]">{aiRoi.estimatedReach?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-[var(--text-secondary)]">Est. Engagement</span>
              <span className="text-sm font-bold text-[var(--text-primary)]">{aiRoi.estimatedEngagement?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-[var(--text-secondary)]">ROI Multiplier</span>
              <span className="text-sm font-black text-emerald-500">{aiRoi.roiMultiplier}x</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] italic leading-relaxed">{aiRoi.analysis}</p>
          </div>
        ) : (
          <button 
            onClick={handlePredictRoi}
            disabled={isPredictingRoi}
            className="w-full py-3 bg-[var(--violet)]/10 text-[#7C5CFF] border border-[#7C5CFF]/30 hover:bg-[#7C5CFF]/20 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
          >
            {isPredictingRoi ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            Predict ROI for Applicant Pool
          </button>
        )}
      </div>

`;

content = content.replace(
  "<div className=\"grid grid-cols-1 gap-5\">",
  predictiveRoiHtml + "\n      <div className=\"grid grid-cols-1 gap-5\">"
);

fs.writeFileSync(path, content);
