import { useParams, useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { ArrowLeft, Building2, Mail, Phone, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useContact, useContacts } from '@/hooks/useContacts';
import { useInteractions } from '@/hooks/useInteractions';
import { useAuth } from '@/hooks/useAuth';
import { RelationshipStrength } from '@/components/contacts/RelationshipStrength';
import { StageBadge } from '@/components/contacts/StageBadge';
import { AddInteractionModal } from '@/components/contacts/AddInteractionModal';
import { EditContactModal } from '@/components/contacts/EditContactModal';
import { INTERACTION_TYPES } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: contact, isLoading: contactLoading } = useContact(id);
  const { deleteContact } = useContacts(user?.id);
  const { interactions, isLoading: interactionsLoading } = useInteractions(id, user?.id);

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteContact.mutateAsync(id);
      toast.success('Contact deleted');
      navigate('/pipeline');
    } catch (error) {
      toast.error('Failed to delete contact');
    }
  };

  if (contactLoading || !contact) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Button
        variant="ghost"
        className="gap-2"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{contact.name}</h1>
            <StageBadge stage={contact.stage} />
          </div>
          <div className="flex items-center gap-4 text-muted-foreground">
            {contact.firm && (
              <div className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                <span>
                  {contact.position && `${contact.position} @ `}
                  {contact.firm}
                  {contact.group_name && ` (${contact.group_name})`}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <EditContactModal contact={contact} />
          <Button variant="outline" size="sm" disabled>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Email
          </Button>
          <AddInteractionModal contactId={contact.id} />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Contact</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {contact.name}? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground mb-1">Relationship</div>
            <RelationshipStrength strength={contact.relationship_strength} size="md" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground mb-1">Connection Type</div>
            <div className="font-medium capitalize">{contact.connection_type}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground mb-1">Last Contact</div>
            <div className="font-medium">
              {contact.last_contacted_at
                ? formatDistanceToNow(new Date(contact.last_contacted_at), { addSuffix: true })
                : 'Never'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground mb-1">Next Follow-up</div>
            <div className="font-medium">
              {contact.next_followup_at
                ? format(new Date(contact.next_followup_at), 'MMM d, yyyy')
                : 'Not scheduled'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Info */}
      {(contact.email || contact.phone) && (
        <Card>
          <CardContent className="pt-4 flex gap-6">
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <Mail className="h-4 w-4" />
                {contact.email}
              </a>
            )}
            {contact.phone && (
              <a
                href={`tel:${contact.phone}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <Phone className="h-4 w-4" />
                {contact.phone}
              </a>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          {interactionsLoading ? (
            <div className="animate-pulse text-muted-foreground">Loading interactions...</div>
          ) : interactions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground mb-4">No interactions yet</p>
                <AddInteractionModal contactId={contact.id} />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {interactions.map((interaction) => {
                const typeConfig = INTERACTION_TYPES.find((t) => t.value === interaction.type);
                return (
                  <Card key={interaction.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                          {typeConfig?.label || interaction.type}
                        </CardTitle>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(interaction.date), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </CardHeader>
                    {interaction.notes && (
                      <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {interaction.notes}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardContent className="pt-4">
              {contact.notes_summary ? (
                <p className="text-sm whitespace-pre-wrap">{contact.notes_summary}</p>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No notes yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
