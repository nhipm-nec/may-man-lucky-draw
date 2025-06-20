import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Gift, Users, Download, Upload, Play, Sparkles, Settings, Plus, Trash2, Edit, Image, Crown, Trophy, Medal, X as LucideX, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import ConfettiEffect from '@/components/ConfettiEffect';
import WinnersList from '@/components/WinnersList';
import * as XLSX from 'xlsx';

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

const Index = () => {
  const [currentPrize, setCurrentPrize] = useState<Prize>({
    id: '1',
    name: 'Giải Nhất (1)',
    quantity: 1,
    winners: []
  });
  
  const [users, setUsers] = useState<User[]>([]);
  
  const [prizes, setPrizes] = useState<Prize[]>([
    { id: '1', name: 'Giải Nhất (1)', quantity: 1, winners: [] }
  ]);
  
  const [luckyNumber, setLuckyNumber] = useState<string>('000');
  const [winnerName, setWinnerName] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Prize management states
  const [newPrizeName, setNewPrizeName] = useState('');
  const [newPrizeQuantity, setNewPrizeQuantity] = useState(1);
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null);
  
  // Customization states
  const [backgroundColor, setBackgroundColor] = useState('#fef7ff');
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [prizeColor, setPrizeColor] = useState('#8b5cf6');
  const [winnerColor, setWinnerColor] = useState('#ec4899');
  const [luckyNumberBgColor, setLuckyNumberBgColor] = useState('#f3e8ff');
  const [winnerBgColor, setWinnerBgColor] = useState('#fdf2f8');
  const [cardBgColor, setCardBgColor] = useState('#ffffff');
  const [luckyNumberColor, setLuckyNumberColor] = useState('#8b5cf6');
  
  // Text customization
  const [appTitle, setAppTitle] = useState('Lucky Draw – NAC Studio');
  const [appTitleColor, setAppTitleColor] = useState('#8b5cf6');
  const [appSubtitle, setAppSubtitle] = useState('Chương trình quay số may mắn');
  const [appSubtitleColor, setAppSubtitleColor] = useState('#6b7280');
  const [luckyNumberLabel, setLuckyNumberLabel] = useState('Số may mắn');
  const [winnerLabel, setWinnerLabel] = useState('Người chiến thắng');
  const [drawButtonText, setDrawButtonText] = useState('Quay số');
  const [drawingText, setDrawingText] = useState('Đang quay...');

  // New state for speed control
  const [spinSpeed, setSpinSpeed] = useState(100); // milliseconds between number changes

  // Settings dialog state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Drawing interval reference
  const [drawingInterval, setDrawingInterval] = useState<NodeJS.Timeout | null>(null);

  // Track if first draw has been started
  const [hasStartedFirstDraw, setHasStartedFirstDraw] = useState(false);

  // Thêm state cho dialog xoá
  const [deleteWinnerIndex, setDeleteWinnerIndex] = useState<number|null>(null);

  useEffect(() => {
    // Remove old style if exists
    const oldStyle = document.getElementById('dynamic-font-family');
    if (oldStyle) oldStyle.remove();
    // Create new style
    const style = document.createElement('style');
    style.id = 'dynamic-font-family';
    style.innerHTML = `body { font-family: '${fontFamily}', sans-serif !important; }`;
    document.head.appendChild(style);
  }, [fontFamily]);

  // Function to get prize icon
  const getPrizeIcon = (prizeName: string) => {
    return <Gift className="text-blue-500" size={24} />;
  };

  // Keyboard event handler
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (isDrawing) {
          stopDrawing();
        } else if (hasStartedFirstDraw && currentPrize.winners.length < currentPrize.quantity) {
          startDrawing();
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isDrawing, hasStartedFirstDraw, currentPrize.winners.length, currentPrize.quantity]);

  const stopDrawing = () => {
    if (drawingInterval) {
      clearInterval(drawingInterval);
      setDrawingInterval(null);
    }

    const availableUsers = users.filter(user => 
      !prizes.some(prize => prize.winners.includes(user.name))
    );
    
    // Select random winner
    const randomIndex = Math.floor(Math.random() * availableUsers.length);
    const winner = availableUsers[randomIndex];
    
    setLuckyNumber((randomIndex + 1).toString().padStart(3, '0'));
    setWinnerName(winner.name);
    setIsDrawing(false);
    
    // Update prize winners - add new winner to the BEGINNING of the array
    const updatedPrizes = prizes.map(prize => 
      prize.id === currentPrize.id 
        ? { ...prize, winners: [winner.name, ...prize.winners] } // Add to beginning instead of end
        : prize
    );
    setPrizes(updatedPrizes);
    
    const updatedCurrentPrize = updatedPrizes.find(p => p.id === currentPrize.id);
    if (updatedCurrentPrize) {
      setCurrentPrize(updatedCurrentPrize);
    }
    
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const addPrize = () => {
    if (!newPrizeName.trim() || newPrizeQuantity < 1) {
      toast.error('Vui lòng nhập tên giải thưởng và số lượt quay hợp lệ!');
      return;
    }
    
    const newPrize: Prize = {
      id: Date.now().toString(),
      name: `${newPrizeName} (${newPrizeQuantity})`,
      quantity: newPrizeQuantity,
      winners: []
    };
    
    setPrizes([...prizes, newPrize]);
    setNewPrizeName('');
    setNewPrizeQuantity(1);
    toast.success('Đã thêm giải thưởng mới!');
  };

  const deletePrize = (prizeId: string) => {
    if (prizes.length <= 1) {
      toast.error('Phải có ít nhất một giải thưởng!');
      return;
    }
    
    const updatedPrizes = prizes.filter(p => p.id !== prizeId);
    setPrizes(updatedPrizes);
    
    if (currentPrize.id === prizeId) {
      setCurrentPrize(updatedPrizes[0]);
    }
    
    toast.success('Đã xóa giải thưởng!');
  };

  const startEditPrize = (prize: Prize) => {
    setEditingPrize(prize);
    const match = prize.name.match(/^(.+)\s+\((\d+)\)$/);
    if (match) {
      setNewPrizeName(match[1]);
    } else {
      setNewPrizeName(prize.name);
    }
    setNewPrizeQuantity(1);
  };

  const saveEditPrize = () => {
    if (!editingPrize || !newPrizeName.trim() || newPrizeQuantity < 1) {
      toast.error('Vui lòng nhập tên giải thưởng và số lượt quay hợp lệ!');
      return;
    }
    
    const updatedPrizes = prizes.map(p => 
      p.id === editingPrize.id 
        ? { ...p, name: `${newPrizeName} (${newPrizeQuantity})`, quantity: newPrizeQuantity }
        : p
    );
    
    setPrizes(updatedPrizes);
    
    if (currentPrize.id === editingPrize.id) {
      const updatedCurrentPrize = updatedPrizes.find(p => p.id === editingPrize.id);
      if (updatedCurrentPrize) {
        setCurrentPrize(updatedCurrentPrize);
      }
    }
    
    setEditingPrize(null);
    setNewPrizeName('');
    setNewPrizeQuantity(1);
    toast.success('Đã cập nhật giải thưởng!');
  };

  const cancelEditPrize = () => {
    setEditingPrize(null);
    setNewPrizeName('');
    setNewPrizeQuantity(1);
  };

  const startDrawing = () => {
    const availableUsers = users.filter(user => 
      !prizes.some(prize => prize.winners.includes(user.name))
    );
    
    if (availableUsers.length === 0) {
      toast.error('Không còn người dùng nào để quay thưởng!');
      return;
    }
    
    if (currentPrize.winners.length >= currentPrize.quantity) {
      toast.error('Giải thưởng này đã hết!');
      return;
    }
    
    setIsDrawing(true);
    setWinnerName('');
    setHasStartedFirstDraw(true);
    
    // Animated number spinning
    const interval = setInterval(() => {
      setLuckyNumber(Math.floor(Math.random() * 1000).toString().padStart(3, '0'));
    }, spinSpeed);
    
    setDrawingInterval(interval);
  };
  
  const exportResults = () => {
    const results = prizes
      .filter(prize => prize.winners.length > 0)
      .map(prize => {
        const winnersWithInfo = prize.winners.map(winner => {
          const userInfo = users.find(user => user.name === winner);
          return userInfo?.info ? `${winner} - ${userInfo.info}` : winner;
        });
        return `${prize.name}:\n${winnersWithInfo.map((winner, index) => `${index + 1}. ${winner}`).join('\n')}`;
      })
      .join('\n\n');
    
    const blob = new Blob([results], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ket-qua-quay-thuong.txt';
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Đã xuất kết quả thành công!');
  };

  const downloadTemplate = () => {
    const templateData = [
      { Number: 1, Name: 'Nguyễn Văn A', Note: 'Phòng IT' },
      { Number: 2, Name: 'Trần Thị B', Note: 'Phòng HR' },
      { Number: 3, Name: 'Lê Văn C', Note: 'Phòng Sales' },
      { Number: 4, Name: 'Phạm Thị D', Note: 'Phòng Marketing' },
      { Number: 5, Name: 'Hoàng Văn E', Note: 'Phòng Finance' }
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    XLSX.writeFile(workbook, 'template-nguoi-dung.xlsx');
    
    toast.success('Đã tải xuống template thành công!');
  };

  const downloadPrizeTemplate = () => {
    const templateData = [
      { Name: 'Giải Nhất', Quantity: 1 },
      { Name: 'Giải Nhì', Quantity: 2 },
      { Name: 'Giải Ba', Quantity: 3 },
      { Name: 'Giải Khuyến Khích', Quantity: 5 }
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Prizes');
    XLSX.writeFile(workbook, 'template-giai-thuong.xlsx');
    
    toast.success('Đã tải xuống template giải thưởng thành công!');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          toast.error('File trống hoặc không đúng định dạng!');
          return;
        }
        
        const firstRow = jsonData[0] as any;
        let newUsers;
        
        if ('Number' in firstRow && 'Name' in firstRow && 'Note' in firstRow) {
          newUsers = jsonData.map((row: any) => ({
            id: row['Number']?.toString() || `user-${Date.now()}-${Math.random()}`,
            name: row['Name'] || 'Không có tên',
            info: row['Note'] || ''
          }));
        } else if ('ID' in firstRow && 'Name' in firstRow && 'Info' in firstRow) {
          newUsers = jsonData.map((row: any, index) => ({
            id: row['ID']?.toString() || `user-${Date.now()}-${index}`,
            name: row['Name'] || 'Không có tên',
            info: row['Info'] || ''
          }));
        } else {
          toast.error('File người dùng phải có các cột: Number, Name, Note hoặc ID, Name, Info!');
          return;
        }
        
        setUsers(newUsers);
        // Reset winners of all prizes
        setPrizes(prev => prev.map(prize => ({ ...prize, winners: [] })));
        setCurrentPrize(prev => prev ? { ...prev, winners: [] } : prev);
        setWinnerName('');
        setLuckyNumber('000');
        toast.success(`Đã tải lên ${newUsers.length} người dùng!`);
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        toast.error('Lỗi xử lý file Excel. Vui lòng kiểm tra lại định dạng file!');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handlePrizeFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          toast.error('File trống hoặc không đúng định dạng!');
          return;
        }
        
        const firstRow = jsonData[0] as any;
        let newPrizes;
        
        if ('Name' in firstRow && 'Quantity' in firstRow) {
          newPrizes = jsonData.map((row: any, index) => ({
            id: (index + 1).toString(),
            name: row['Name'] || `Giải ${index + 1}`,
            quantity: parseInt(row['Quantity']) || 1,
            winners: []
          }));
        } else if ('Tên' in firstRow && 'Số lượng' in firstRow) {
          newPrizes = jsonData.map((row: any, index) => ({
            id: (index + 1).toString(),
            name: row['Tên'] || `Giải ${index + 1}`,
            quantity: parseInt(row['Số lượng']) || 1,
            winners: []
          }));
        } else {
          toast.error('File giải thưởng phải có các cột: Name, Quantity hoặc Tên, Số lượng!');
          return;
        }
        
        setPrizes(newPrizes);
        setCurrentPrize(newPrizes[0]);
        setHasStartedFirstDraw(false);
        toast.success(`Đã tải lên ${newPrizes.length} giải thưởng!`);
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        toast.error('Lỗi xử lý file Excel. Vui lòng kiểm tra lại định dạng file!');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleBackgroundImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setBackgroundImage(imageUrl);
      toast.success('Đã tải lên ảnh nền thành công!');
    };
    reader.readAsDataURL(file);
  };

  const backgroundStyle = backgroundImage 
    ? { 
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    : { backgroundColor };

  return (
    <div className="h-screen overflow-hidden flex flex-col" style={backgroundStyle}>
      {showConfetti && <ConfettiEffect />}
      
      {/* Main Content Area - reduced top padding and spacing */}
      <div className="flex-1 flex flex-col items-center justify-start pt-1 lg:pt-2 xl:pt-3 2xl:pt-4">
        <div className="w-full max-w-2xl flex flex-col items-center justify-center relative">
          {/* Floating Settings and Download Buttons */}
          <div className="fixed top-8 right-6 z-10 flex gap-2">
            <Button 
              size="sm" 
              onClick={exportResults}
              className="bg-white/80 hover:bg-white/90 text-gray-700 rounded-xl shadow-lg backdrop-blur-sm"
            >
              <Download size={20} />
            </Button>
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  className="bg-white/80 hover:bg-white/90 text-gray-700 rounded-xl shadow-lg backdrop-blur-sm"
                >
                  <Settings size={20} />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl flex items-center gap-2">
                    <Settings size={24} />
                    Cài đặt
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6 mt-4">
                  {/* Upload Section - Moved to top */}
                  <div className="grid grid-cols-1 gap-4">
                    {/* Upload người dùng */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Upload size={20} />
                          Upload người chơi
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col md:flex-row gap-2 items-center justify-center">
                          <Button 
                            onClick={downloadTemplate}
                            className="h-10 w-full md:w-40 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white border-0 text-xs font-medium px-3 gap-2"
                          >
                            <Download size={16} />
                            <span>Tải template</span>
                          </Button>

                          <input
                            type="file"
                            accept=".xlsx"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="users-file"
                          />
                          <Button
                            type="button"
                            onClick={() => document.getElementById('users-file')?.click()}
                            className="h-10 w-full md:w-40 flex items-center justify-center bg-violet-500 hover:bg-violet-600 text-white border-0 text-xs font-medium px-3 gap-2"
                          >
                            <Upload size={16} />
                            <span>Upload Excel</span>
                          </Button>
                        </div>
                        <p className="text-xs text-gray-400 mt-2 text-center">Hiện có {users.length} người chơi</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tùy chỉnh giao diện */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Tùy chỉnh giao diện</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm font-bold">Tiêu đề ứng dụng</Label>
                          <div className="flex gap-2">
                            <Input 
                              value={appTitle} 
                              onChange={(e) => setAppTitle(e.target.value)}
                              className="bg-gray-50 border-gray-200 rounded-lg flex-1 font-bold"
                            />
                            <input
                              type="color"
                              value={appTitleColor}
                              onChange={(e) => setAppTitleColor(e.target.value)}
                              className="w-12 h-10 rounded-lg border-2 border-gray-200 cursor-pointer"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-bold">Mô tả</Label>
                          <div className="flex gap-2">
                            <Input 
                              value={appSubtitle} 
                              onChange={(e) => setAppSubtitle(e.target.value)}
                              className="bg-gray-50 border-gray-200 rounded-lg flex-1 font-bold"
                            />
                            <input
                              type="color"
                              value={appSubtitleColor}
                              onChange={(e) => setAppSubtitleColor(e.target.value)}
                              className="w-12 h-10 rounded-lg border-2 border-gray-200 cursor-pointer"
                            />
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div>
                            <Label className="text-sm font-bold">Màu số may mắn</Label>
                            <input
                              type="color"
                              value={luckyNumberColor}
                              onChange={e => setLuckyNumberColor(e.target.value)}
                              className="w-12 h-10 rounded-lg border-2 border-gray-200 cursor-pointer ml-2"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-bold">Màu chữ chọn giải</Label>
                            <input
                              type="color"
                              value={prizeColor}
                              onChange={e => setPrizeColor(e.target.value)}
                              className="w-12 h-10 rounded-lg border-2 border-gray-200 cursor-pointer ml-2"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm">Font chữ</Label>
                          <Select value={fontFamily} onValueChange={setFontFamily}>
                            <SelectTrigger className="h-10 bg-gray-50 border-gray-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Inter" className="font-preview-Inter">Inter</SelectItem>
                              <SelectItem value="Roboto" className="font-preview-Roboto">Roboto</SelectItem>
                              <SelectItem value="Poppins" className="font-preview-Poppins">Poppins</SelectItem>
                              <SelectItem value="Nunito" className="font-preview-Nunito">Nunito</SelectItem>
                              <SelectItem value="Montserrat" className="font-preview-Montserrat">Montserrat</SelectItem>
                              <SelectItem value="Open Sans" className="font-preview-OpenSans">Open Sans</SelectItem>
                              <SelectItem value="Lobster" className="font-preview-Lobster">Lobster</SelectItem>
                              <SelectItem value="Patrick Hand" className="font-preview-PatrickHand">Patrick Hand</SelectItem>
                              <SelectItem value="Be Vietnam Pro" className="font-preview-BeVietnamPro">Be Vietnam Pro</SelectItem>
                              <SelectItem value="Huninn" className="font-preview-Huninn">Huninn</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-sm">Tốc độ quay số (ms)</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="50"
                              max="500"
                              step="10"
                              value={spinSpeed}
                              onChange={(e) => setSpinSpeed(parseInt(e.target.value) || 100)}
                              className="bg-gray-50 border-gray-200 rounded-lg"
                            />
                            <span className="text-sm text-gray-500">
                              {spinSpeed < 100 ? 'Nhanh' : spinSpeed > 200 ? 'Chậm' : 'Vừa'}
                            </span>
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-bold">Ảnh nền</Label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50">
                            <Image className="mx-auto mb-2 text-gray-400" size={24} />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleBackgroundImageUpload}
                              className="hidden"
                              id="background-image"
                            />
                            <Button asChild size="sm" variant="outline" className="font-bold mt-2">
                              <label htmlFor="background-image" className="cursor-pointer">
                                <Upload size={14} className="mr-1" />
                                Chọn ảnh
                              </label>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Quản lý giải thưởng */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Gift size={20} />
                          Quản lý giải thưởng
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3 p-4 bg-gradient-to-r from-violet-50 to-pink-50 rounded-lg border border-violet-200">
                          <div>
                            <Label className="text-sm">Tên giải thưởng</Label>
                            <Input
                              value={newPrizeName}
                              onChange={(e) => setNewPrizeName(e.target.value)}
                              placeholder="Nhập tên giải thưởng"
                              className="bg-white border-violet-200"
                            />
                          </div>
                          <div>
                            <Label className="text-sm">Số lượt quay</Label>
                            <Input
                              type="number"
                              min="0"
                              value={newPrizeQuantity}
                              onChange={(e) => setNewPrizeQuantity(parseInt(e.target.value) || 0)}
                              className="bg-white border-violet-200"
                            />
                          </div>
                          <div className="flex gap-2">
                            {editingPrize ? (
                              <>
                                <Button 
                                  onClick={saveEditPrize} 
                                  size="sm" 
                                  disabled={!newPrizeName.trim() || newPrizeQuantity < 1}
                                  className={`${
                                    !newPrizeName.trim() || newPrizeQuantity < 1
                                      ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed' 
                                      : 'bg-green-500 hover:bg-green-600'
                                  } text-white border-0`}
                                >
                                  Lưu
                                </Button>
                                <Button onClick={cancelEditPrize} size="sm" variant="outline">
                                  Hủy
                                </Button>
                              </>
                            ) : (
                              <Button 
                                onClick={addPrize} 
                                size="sm" 
                                disabled={!newPrizeName.trim() || newPrizeQuantity < 1}
                                className={`${
                                  !newPrizeName.trim() || newPrizeQuantity < 1
                                    ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed' 
                                    : 'bg-violet-500 hover:bg-violet-600'
                                } text-white border-0`}
                              >
                                <Plus size={16} className="mr-1" />
                                Thêm giải
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {prizes.map(prize => (
                            <div key={prize.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                              <span className="text-sm font-medium">{prize.name}</span>
                              <div className="flex gap-1">
                                <Button
                                  onClick={() => startEditPrize(prize)}
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit size={12} />
                                </Button>
                                <Button
                                  onClick={() => deletePrize(prize.id)}
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                                >
                                  <Trash2 size={12} />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Title section - reduced margin */}
          <div className="text-center mb-0.5">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold flex items-center justify-center gap-2 lg:gap-3" style={{ color: appTitleColor }}>
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10 2xl:w-12 2xl:h-12" />
              {appTitle}
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10 2xl:w-12 2xl:h-12" />
            </h1>
            <p className="text-sm sm:text-base lg:text-lg xl:text-xl 2xl:text-2xl" style={{ color: appSubtitleColor }}>{appSubtitle}</p>
          </div>
          
          {/* Prize Select - reduced margin */}
          <div className="flex justify-center mb-0">
            <Select value={currentPrize.id} onValueChange={(value) => {
              const prize = prizes.find(p => p.id === value);
              if (prize) {
                setCurrentPrize(prize);
                setHasStartedFirstDraw(false);
                setWinnerName('');
                setLuckyNumber('000');
              }
            }}>
              <SelectTrigger className="w-60 sm:w-72 lg:w-80 xl:w-96 2xl:w-[28rem] bg-transparent border-0 shadow-none text-lg sm:text-xl lg:text-xl xl:text-2xl 2xl:text-3xl font-bold flex items-center justify-center gap-2 focus:ring-0 focus:border-0 outline-none" style={{ color: prizeColor, boxShadow: 'none', border: 'none' }}>
                <SelectValue>
                  <div className="flex items-center gap-2">
                    {getPrizeIcon(currentPrize.name)}
                    {currentPrize.name}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {prizes.map(prize => (
                  <SelectItem key={prize.id} value={prize.id}>
                    <div className="flex items-center gap-2">
                      {getPrizeIcon(prize.name)}
                      {prize.name} ({prize.winners.length}/{prize.quantity})
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Lucky number and winner display - tightened spacing */}
          <Card className="w-full bg-transparent shadow-none border-0">
            <CardHeader className="text-center pb-0.5">
              {/* Lucky number display */}
              <div className="w-full max-w-xl mx-auto rounded-2xl min-h-28 sm:min-h-32 lg:min-h-36 xl:min-h-40 2xl:min-h-44 flex flex-col justify-center mb-1" style={{ background: luckyNumberBgColor + 'AA' }}>
                <div className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-extrabold tracking-widest" style={{ color: luckyNumberColor }}>{luckyNumber}</div>
              </div>
              
              {/* Winner display - reduced height and margin */}
              <div className="w-full max-w-xl mx-auto rounded-2xl min-h-10 sm:min-h-12 lg:min-h-14 xl:min-h-16 2xl:min-h-18 flex flex-col justify-center mb-2" style={{ background: winnerBgColor + 'AA' }}>
                <div className="text-xs sm:text-sm lg:text-base xl:text-base 2xl:text-lg font-semibold mb-0.5">{winnerLabel}</div>
                <div className="text-lg sm:text-xl lg:text-2xl xl:text-2xl 2xl:text-3xl font-bold tracking-wide" style={{ color: winnerColor }}>
                  {winnerName
                    ? (<>
                        {winnerName}
                        {users.find(user => user.name === winnerName)?.info && (
                          <span className="text-gray-600 ml-1">- {users.find(user => user.name === winnerName)?.info}</span>
                        )}
                      </>)
                    : '---'}
                </div>
              </div>
            </CardHeader>
            
            {/* Button - moved closer with reduced margin */}
            <CardContent className="flex flex-col items-center pt-0">
              <Button
                size="lg"
                className="w-full max-w-xl h-6 sm:h-7 lg:h-8 xl:h-8 2xl:h-10 text-base sm:text-lg lg:text-lg xl:text-lg 2xl:text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-lg hover:from-purple-500 hover:to-pink-500"
                onClick={isDrawing ? stopDrawing : startDrawing}
                disabled={currentPrize.winners.length >= currentPrize.quantity}
              >
                <Play className="mr-2 w-3 h-3 sm:w-4 sm:h-4 lg:w-4 lg:h-4 xl:w-4 xl:h-4 2xl:w-5 2xl:h-5" />
                {isDrawing ? drawingText : drawButtonText}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Winners List - reduced padding and cleaner look */}
      <div className="bg-white/90 backdrop-blur-sm border-t border-gray-200 flex flex-col h-32 lg:h-40 xl:h-48 2xl:h-56">
        <div className="px-4 py-2 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Gift size={20} />
            Người thắng {currentPrize.name}
            <Badge variant="outline" className="ml-auto border-violet-300 text-violet-600">
              {currentPrize.winners.length}/{currentPrize.quantity}
            </Badge>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {currentPrize.winners.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {currentPrize.winners.map((winner, index) => {
                const userInfo = users.find(user => user.name === winner);
                return (
                  <div
                    key={index}
                    className="group relative flex items-center bg-gradient-to-r from-violet-50 to-pink-50 rounded-full border border-violet-200 shadow-sm hover:shadow-md transition-all duration-200 px-4 py-1.5"
                  >
                    {/* Delete button */}
                    <button
                      onClick={() => setDeleteWinnerIndex(index)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100 z-20"
                    >
                      <LucideX size={10} />
                    </button>
                    
                    <span className="flex items-center gap-1">
                      <span 
                        className="font-medium text-sm"
                        style={{ color: winnerColor }}
                      >
                        {winner}
                      </span>
                      {userInfo?.info && (
                        <>
                          <span className="text-gray-400 mx-1">-</span>
                          <span className="text-sm text-gray-600">
                            {userInfo.info}
                          </span>
                        </>
                      )}
                    </span>
                    
                    {/* Delete confirmation dialog */}
                    <Dialog open={deleteWinnerIndex === index} onOpenChange={open => !open && setDeleteWinnerIndex(null)}>
                      <DialogContent className="max-w-xs text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <AlertTriangle className="text-red-500 mb-1" size={36} />
                          <DialogTitle className="font-bold text-lg text-red-600 mb-1">Xác nhận xoá người chiến thắng?</DialogTitle>
                          <div className="text-base font-semibold text-pink-600">{winner}</div>
                          {userInfo?.info && <div className="text-sm text-gray-500 mb-2">{userInfo.info}</div>}
                          <div className="flex gap-2 justify-center mt-2">
                            <Button variant="outline" className="font-bold" onClick={() => setDeleteWinnerIndex(null)}>Huỷ</Button>
                            <Button variant="destructive" className="font-bold" onClick={() => {
                              // Remove from winners
                              const updatedWinners = currentPrize.winners.filter((w, i) => i !== index);
                              const updatedPrizes = prizes.map(prize =>
                                prize.id === currentPrize.id
                                  ? { ...prize, winners: updatedWinners }
                                  : prize
                              );
                              setPrizes(updatedPrizes);
                              setCurrentPrize({ ...currentPrize, winners: updatedWinners });
                              if (winnerName === winner) setWinnerName('');
                              setDeleteWinnerIndex(null);
                            }}>Xoá</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 flex flex-col items-center justify-center">
              <Gift size={32} className="mx-auto mb-2 opacity-50" />
              <p>Chưa có người thắng</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
