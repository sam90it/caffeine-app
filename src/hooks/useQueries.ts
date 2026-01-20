cat << 'EOF' > ~/projects/caffeine-app/src/hooks/useQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export const useGetCallerUserProfile = () => {
  const { actor } = useActor();
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => await actor?.getCallerUserProfile(),
    enabled: !!actor,
  });
};

export const useGetSummaryDashboard = () => {
  const { actor } = useActor();
  return useQuery({
    queryKey: ['summary'],
    queryFn: async () => await actor?.getSummaryDashboard(),
    enabled: !!actor,
  });
};

export const useApproveLedgerEntry = () => {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ personId, transactionId }: { personId: bigint; transactionId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return await actor.approveLedgerEntry(personId, transactionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['pendingLedgerEntries'] });
    },
  });
};

export const useRejectLedgerEntry = () => {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ personId, transactionId }: { personId: bigint; transactionId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return await actor.rejectLedgerEntry(personId, transactionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingLedgerEntries'] });
    },
  });
};
EOF