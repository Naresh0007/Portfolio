import { TripLeg } from '../types';
import { Bus, Train, TramFront as Tram, Anchor, PersonStanding, ChevronRight } from 'lucide-react';

interface Props {
    legs: TripLeg[];
}

export default function Timeline({ legs }: Props) {
    const getIcon = (mode: string) => {
        switch (mode.toLowerCase()) {
            case 'train': return <Train className="w-4 h-4" />;
            case 'bus': return <Bus className="w-4 h-4" />;
            case 'metro': return <Tram className="w-4 h-4" />;
            case 'light rail': return <Tram className="w-4 h-4" />;
            case 'ferry': return <Anchor className="w-4 h-4" />;
            default: return <PersonStanding className="w-4 h-4" />;
        }
    };

    return (
        <div className="flex items-center gap-1 overflow-hidden">
            {legs.map((leg, i) => (
                <div key={i} className="flex items-center">
                    <div
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${leg.mode === 'Walk'
                                ? 'bg-gray-100 text-gray-400'
                                : 'bg-[#002664]/10 text-[#002664] border border-[#002664]/20'
                            }`}
                    >
                        {getIcon(leg.mode)}
                        {leg.mode !== 'Walk' && <span>{leg.line}</span>}
                    </div>
                    {i < legs.length - 1 && <ChevronRight className="w-3 h-3 text-gray-300 mx-1" />}
                </div>
            ))}
        </div>
    );
}
