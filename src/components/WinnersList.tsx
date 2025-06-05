
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Crown, Medal, Award } from 'lucide-react';

interface Prize {
  id: string;
  name: string;
  quantity: number;
  winners: string[];
}

interface WinnersListProps {
  currentPrize: Prize;
  allPrizes: Prize[];
  winnerColor: string;
  cardBgColor: string;
}

const WinnersList = ({ currentPrize, allPrizes, winnerColor, cardBgColor }: WinnersListProps) => {
  const getIcon = (prizeName: string) => {
    if (prizeName.includes('Nhất')) return <Crown className="text-yellow-500" size={20} />;
    if (prizeName.includes('Nhì')) return <Trophy className="text-gray-400" size={20} />;
    if (prizeName.includes('Ba')) return <Medal className="text-amber-600" size={20} />;
    return <Award className="text-blue-500" size={20} />;
  };

  return (
    <div className="space-y-4">
      {/* Current Prize Winners */}
      <Card className="backdrop-blur-sm shadow-xl border-0 rounded-xl" style={{ backgroundColor: cardBgColor }}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            {getIcon(currentPrize.name)}
            Người thắng {currentPrize.name}
          </CardTitle>
          <Badge variant="outline" className="w-fit border-violet-300 text-violet-600">
            {currentPrize.winners.length}/{currentPrize.quantity}
          </Badge>
        </CardHeader>
        <CardContent>
          {currentPrize.winners.length > 0 ? (
            <div className="space-y-2">
              {currentPrize.winners.map((winner, index) => (
                <div
                  key={index}
                  className="p-3 bg-gradient-to-r from-violet-50 to-pink-50 rounded-lg border border-violet-200 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span 
                      className="font-semibold"
                      style={{ color: winnerColor }}
                    >
                      {winner}
                    </span>
                    <Badge className="bg-gradient-to-r from-violet-500 to-pink-500 text-white border-0">
                      #{index + 1}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Award size={32} className="mx-auto mb-2 opacity-50" />
              <p>Chưa có người thắng</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Prizes Summary */}
      <Card className="backdrop-blur-sm shadow-xl border-0 rounded-xl" style={{ backgroundColor: cardBgColor }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Tổng kết giải thưởng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {allPrizes.map(prize => (
              <div
                key={prize.id}
                className={`p-3 rounded-lg border transition-all duration-200 ${
                  prize.id === currentPrize.id
                    ? 'bg-gradient-to-r from-violet-100 to-pink-100 border-violet-300 shadow-sm'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getIcon(prize.name)}
                    <span className="font-medium text-sm">{prize.name}</span>
                  </div>
                  <Badge 
                    variant={prize.winners.length === prize.quantity ? "default" : "outline"}
                    className={prize.winners.length === prize.quantity ? "bg-green-500 border-0" : "border-gray-300"}
                  >
                    {prize.winners.length}/{prize.quantity}
                  </Badge>
                </div>
                
                {prize.winners.length > 0 && (
                  <div className="space-y-1">
                    {prize.winners.map((winner, index) => (
                      <div key={index} className="text-xs text-gray-600 flex items-center gap-1">
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        {winner}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WinnersList;
