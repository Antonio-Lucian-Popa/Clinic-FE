import React, { useState } from 'react';
import { UserPlus, Mail, Copy, ExternalLink, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

function InvitationPage() {
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinWithCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      toast.error('Te rog introdu codul de invitație');
      return;
    }

    try {
      setIsLoading(true);
      // API call pentru a se alătura cabinetului cu codul
      console.log('Joining with code:', inviteCode);
      toast.success('Te-ai alăturat cu succes cabinetului!');
      window.location.href = '/dashboard';
    } catch (error) {
      toast.error('Cod de invitație invalid sau expirat');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiat în clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-8">
      <div className="max-w-md mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-green-600 shadow-lg">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Alătură-te unui Cabinet
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Introdu codul de invitație primit de la administratorul cabinetului
          </p>
        </div>

        {/* Join Form */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Cod de Invitație</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleJoinWithCode} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="inviteCode"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="Introdu codul de invitație"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                disabled={isLoading}
              >
                {isLoading ? 'Mă alătur...' : 'Alătură-te Cabinetului'}
              </Button>
            </form>

            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
              <UserPlus className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                Codul de invitație îl primești de la proprietarul sau administratorul cabinetului medical.
              </AlertDescription>
            </Alert>

            {/* Alternative Actions */}
            <div className="space-y-3 pt-4 border-t">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Nu ai un cod de invitație?
              </p>
              <div className="flex flex-col space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/contact">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Contactează Suportul
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full" asChild>
                  <Link to="/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Înapoi la Dashboard
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default InvitationPage;