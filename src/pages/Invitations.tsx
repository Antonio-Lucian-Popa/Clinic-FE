import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Mail, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MoreVertical,
  Send,
  Trash2,
  Copy,
  Users,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';



import { toast } from 'sonner';
import { Invitation, invitationService } from '@/services/invitationService';
import { useClinic } from '@/contexts/ClinicContex';
import InviteStaffModal from '@/components/Modals/InviteStaffModal';

function Invitations() {
  const { currentClinic } = useClinic();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  useEffect(() => {
    if (currentClinic) {
      loadInvitations();
    }
  }, [currentClinic]);

  const loadInvitations = async () => {
    try {
      setIsLoading(true);
      const invitationsData = await invitationService.getMyInvitations();
      setInvitations(invitationsData);
    } catch (error) {
      console.error('Failed to load invitations:', error);
      toast.error('Failed to load invitations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      await invitationService.cancelInvitation(invitationId);
      toast.success('Invitation cancelled successfully');
      loadInvitations();
    } catch (error) {
      toast.error('Failed to cancel invitation');
    }
  };

  const handleResendInvitation = async (invitation: Invitation) => {
    try {
      await invitationService.resendInvitation(invitation.id);
      toast.success('Invitation resent successfully');
      loadInvitations();
    } catch (error) {
      toast.error('Failed to resend invitation');
    }
  };

  const copyInvitationLink = (invitation: Invitation) => {
    // În practică, aici ai avea link-ul real de invitație
    const inviteLink = `${window.location.origin}/accept-invite?token=${invitation.id}`;
    navigator.clipboard.writeText(inviteLink);
    toast.success('Invitation link copied to clipboard!');
  };

  const filteredInvitations = invitations.filter(invitation => {
    const matchesSearch = 
      invitation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invitation.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === 'all' || invitation.status.toLowerCase() === activeTab;
    
    return matchesSearch && matchesTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return <Badge variant="outline" className="text-orange-600 border-orange-200">Pending</Badge>;
      case 'ACCEPTED':
        return <Badge variant="outline" className="text-green-600 border-green-200">Accepted</Badge>;
      case 'EXPIRED':
        return <Badge variant="outline" className="text-red-600 border-red-200">Expired</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-orange-600" />;
      case 'ACCEPTED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'EXPIRED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toUpperCase()) {
      case 'DOCTOR':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'ASSISTANT':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'RECEPTIONIST':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Staff Invitations
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Invite and manage staff members for {currentClinic?.name}
          </p>
        </div>
        <Button 
          onClick={() => setIsInviteModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Staff Member
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Search invitations by email or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Invitations</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{invitations.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {invitations.filter(i => i.status === 'PENDING').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Accepted</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {invitations.filter(i => i.status === 'ACCEPTED').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Expired</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {invitations.filter(i => i.status === 'EXPIRED').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredInvitations.length > 0 ? (
            filteredInvitations.map((invitation) => (
              <Card key={invitation.id} className="hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex items-center space-x-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                        <Mail className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {invitation.email}
                          </h3>
                          {getStatusBadge(invitation.status)}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getRoleColor(invitation.role)}>
                            {invitation.role}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            Invited {new Date(invitation.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {invitation.acceptedAt && (
                          <p className="text-sm text-green-600">
                            Accepted on {new Date(invitation.acceptedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {getStatusIcon(invitation.status)}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {invitation.status === 'PENDING' && (
                            <>
                              <DropdownMenuItem onClick={() => handleResendInvitation(invitation)}>
                                <Send className="mr-2 h-4 w-4" />
                                Resend Invitation
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => copyInvitationLink(invitation)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy Invitation Link
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleCancelInvitation(invitation.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Cancel Invitation
                              </DropdownMenuItem>
                            </>
                          )}
                          {invitation.status === 'ACCEPTED' && (
                            <DropdownMenuItem disabled>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Already Accepted
                            </DropdownMenuItem>
                          )}
                          {invitation.status === 'EXPIRED' && (
                            <DropdownMenuItem onClick={() => handleResendInvitation(invitation)}>
                              <Send className="mr-2 h-4 w-4" />
                              Send New Invitation
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || activeTab !== 'all' 
                  ? 'No invitations found matching your criteria.' 
                  : 'No staff invitations sent yet.'
                }
              </p>
              <Button 
                onClick={() => setIsInviteModalOpen(true)}
                className="mt-4"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Send First Invitation
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Invite Staff Modal */}
      <InviteStaffModal 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)}
        onInviteSent={loadInvitations}
      />
    </div>
  );
}

export default Invitations;