import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Crown, Medal, Award } from 'lucide-react';

interface Prize {
  id: string;
  name: string;
  quantity: number;
  winners: string[];
}

interface User {
  id: string;
  name: string;
  info?: string;
}

interface WinnersListProps {
  currentPrize: Prize;
  allPrizes: Prize[];
  users: User[];
  winnerColor: string;
  cardBgColor: string;
}

const WinnersList = ({ currentPrize, allPrizes, users, winnerColor, cardBgColor }: WinnersListProps) => {
  const getIcon = (prizeName: string) => {
    if (prizeName.includes('Nhất')) return <Crown className="text-yellow-500" size={20} />;
    if (prizeName.includes('Nhì')) return <Trophy className="text-gray-400" size={20} />;
    if (prizeName.includes('Ba')) return <Medal className="text-amber-600" size={20} />;
    return <Award className="text-blue-500" size={20} />;
  };

  // Get user info by name
  const getUserInfo = (winnerName: string) => {
    return users.find(user => user.name === winnerName);
  };

  return (
    <div className="h-full">
      {/* Current Prize Winners */}
      <Card className="backdrop-blur-sm shadow-xl border-0 rounded-xl h-full flex flex-col" style={{ backgroundColor: cardBgColor }}>
        <CardHeader className="pb-3 flex-shrink-0">
          <CardTitle className="flex items-center gap-2 text-lg">
            {getIcon(currentPrize.name)}
            Người thắng {currentPrize.name}
          </CardTitle>
          <Badge variant="outline" className="w-fit border-violet-300 text-violet-600">
            {currentPrize.winners.length}/{currentPrize.quantity}
          </Badge>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          {currentPrize.winners.length > 0 ? (
            <div className="space-y-2 h-full overflow-y-auto pr-2">
              {currentPrize.winners.map((winner, index) => {
                const userInfo = getUserInfo(winner);
                return (
                  <div
                    key={index}
                    className="p-3 bg-gradient-to-r from-violet-50 to-pink-50 rounded-lg border border-violet-200 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-1">
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
                    {userInfo?.info && (
                      <div className="text-sm text-gray-600">
                        {userInfo.info}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 h-full flex flex-col items-center justify-center">
              <Award size={32} className="mx-auto mb-2 opacity-50" />
              <p>Chưa có người thắng</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WinnersList;
