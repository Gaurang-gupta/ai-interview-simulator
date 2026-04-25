type Props = {
    level: string;
    unlocked: boolean;
    score?: number;
    onClick: () => void;
};

export default function LevelCard({ level, unlocked, score, onClick }: Props) {
    return (
        <div
            onClick={unlocked ? onClick : undefined}
            className={`p-6 rounded-xl border cursor-pointer transition ${
                unlocked
                    ? "bg-white hover:shadow-lg"
                    : "bg-gray-200 cursor-not-allowed"
            }`}
        >
            <h2 className="text-lg font-bold capitalize">{level}</h2>

            {!unlocked && (
                <p className="text-red-500 text-sm mt-2">Locked</p>
            )}

            {score !== undefined && (
                <p className="text-sm mt-2 text-gray-600">
                    Prev Score: {score}
                </p>
            )}
        </div>
    );
}