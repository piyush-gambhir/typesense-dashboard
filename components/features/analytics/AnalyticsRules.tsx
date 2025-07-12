'use client';

import { PlusCircle, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
    createAnalyticsRule,
    deleteAnalyticsRule,
    listAnalyticsRules,
} from '@/lib/typesense/analytics-rules';

import { toast } from '@/hooks/useToast';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

interface AnalyticsRule {
    id: string;
    rule: Record<string, unknown>;
}

export default function AnalyticsRules() {
    const [rules, setRules] = useState<AnalyticsRule[]>([]);
    const [newRuleName, setNewRuleName] = useState('');
    const [newRuleJson, setNewRuleJson] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [ruleToDelete, setRuleToDelete] = useState<string | null>(null);

    const fetchRules = async () => {
        try {
            const fetchedRules = await listAnalyticsRules();
            if (fetchedRules) {
                setRules(fetchedRules as unknown as AnalyticsRule[]);
            }
        } catch {
            toast({
                title: 'Error',
                description: 'Failed to load analytics rules.',
                variant: 'destructive',
            });
        }
    };

    useEffect(() => {
        fetchRules();
    }, []);

    const handleCreateRule = async () => {
        if (!newRuleName || !newRuleJson) {
            toast({
                title: 'Error',
                description: 'Please fill in all fields.',
                variant: 'destructive',
            });
            return;
        }

        try {
            const parsedRule = JSON.parse(newRuleJson);
            setIsCreating(true);
            const created = await createAnalyticsRule(newRuleName, parsedRule);
            if (created) {
                toast({
                    title: 'Analytics Rule Created',
                    description: `Rule '${newRuleName}' created successfully.`,
                });
                setNewRuleName('');
                setNewRuleJson('');
                fetchRules();
            } else {
                toast({
                    title: 'Error',
                    description: 'Failed to create analytics rule.',
                    variant: 'destructive',
                });
            }
        } catch (error: unknown) {
            toast({
                title: 'Error',
                description:
                    error instanceof Error
                        ? error.message
                        : 'Failed to create analytics rule',
                variant: 'destructive',
            });
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteRule = async () => {
        if (!ruleToDelete) return;

        try {
            const deleted = await deleteAnalyticsRule(ruleToDelete);
            if (deleted) {
                toast({
                    title: 'Analytics Rule Deleted',
                    description: `Rule '${ruleToDelete}' deleted successfully.`,
                });
                fetchRules();
            } else {
                toast({
                    title: 'Error',
                    description: 'Failed to delete analytics rule.',
                    variant: 'destructive',
                });
            }
        } catch (error: unknown) {
            toast({
                title: 'Error',
                description:
                    error instanceof Error
                        ? error.message
                        : 'Failed to delete analytics rule',
                variant: 'destructive',
            });
        } finally {
            setIsDeleteDialogOpen(false);
            setRuleToDelete(null);
        }
    };

    return (
        <div className="container mx-auto p-8 flex flex-col gap-y-8">
            <Card className="shadow-none">
                <CardHeader>
                    <CardTitle>Analytics Rules</CardTitle>
                    <CardDescription>
                        Manage your Typesense analytics rules.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Rule Name</TableHead>
                                <TableHead>Rule Definition</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rules.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={3}
                                        className="text-center"
                                    >
                                        No analytics rules found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rules.map((rule) => (
                                    <TableRow key={rule.id}>
                                        <TableCell className="font-medium">
                                            {rule.id}
                                        </TableCell>
                                        <TableCell>
                                            <pre className="whitespace-pre-wrap text-sm">
                                                {JSON.stringify(
                                                    rule.rule,
                                                    null,
                                                    2,
                                                )}
                                            </pre>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => {
                                                    setRuleToDelete(rule.id);
                                                    setIsDeleteDialogOpen(true);
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Create New Rule
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>
                                    Create New Analytics Rule
                                </DialogTitle>
                                <DialogDescription>
                                    Create a new analytics rule by providing a
                                    name and JSON definition.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="rule-name"
                                        className="text-right"
                                    >
                                        Rule Name
                                    </Label>
                                    <Input
                                        id="rule-name"
                                        value={newRuleName}
                                        onChange={(e) =>
                                            setNewRuleName(e.target.value)
                                        }
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="rule-json"
                                        className="text-right"
                                    >
                                        Rule JSON
                                    </Label>
                                    <Textarea
                                        id="rule-json"
                                        value={newRuleJson}
                                        onChange={(e) =>
                                            setNewRuleJson(e.target.value)
                                        }
                                        className="col-span-3 font-mono h-48"
                                        placeholder="Enter rule JSON here..."
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    onClick={handleCreateRule}
                                    disabled={isCreating}
                                >
                                    {isCreating ? 'Creating...' : 'Create Rule'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardFooter>
            </Card>

            <Dialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently
                            delete the analytics rule{' '}
                            <span className="font-bold">{ruleToDelete}</span>.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteRule}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
