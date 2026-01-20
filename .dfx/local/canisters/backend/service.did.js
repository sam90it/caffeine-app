export const idlFactory = ({ IDL }) => {
  const Amount = IDL.Int;
  const TransactionType = IDL.Variant({
    'credit' : IDL.Null,
    'debit' : IDL.Null,
  });
  const Timestamp = IDL.Int;
  const PersonId = IDL.Int;
  const PersonProfile = IDL.Record({
    'id' : PersonId,
    'name' : IDL.Text,
    'approvalStatus' : IDL.Bool,
  });
  const UserProfile = IDL.Record({
    'name' : IDL.Text,
    'countryCode' : IDL.Text,
    'currencyPreference' : IDL.Text,
    'phone' : IDL.Text,
  });
  const BalanceSummary = IDL.Record({
    'totalLent' : Amount,
    'totalOwed' : Amount,
    'totalRepaid' : Amount,
    'remainingDue' : Amount,
  });
  const TransactionId = IDL.Int;
  const LedgerStatus = IDL.Variant({
    'pending' : IDL.Null,
    'approved' : IDL.Null,
    'rejected' : IDL.Null,
    'archived' : IDL.Null,
  });
  const LedgerEntry = IDL.Record({
    'id' : TransactionId,
    'status' : LedgerStatus,
    'transactionType' : TransactionType,
    'date' : Timestamp,
    'description' : IDL.Text,
    'counterparty' : IDL.Principal,
    'counterpartId' : IDL.Opt(TransactionId),
    'currency' : IDL.Text,
    'amount' : Amount,
  });
  return IDL.Service({
    'addLedgerEntry' : IDL.Func(
        [
          IDL.Int,
          Amount,
          TransactionType,
          IDL.Text,
          Timestamp,
          IDL.Text,
          IDL.Principal,
        ],
        [IDL.Int, IDL.Opt(IDL.Int)],
        [],
      ),
    'createPersonProfile' : IDL.Func([IDL.Text], [IDL.Int], []),
    'getAllPeople' : IDL.Func([], [IDL.Vec(PersonProfile)], ['query']),
    'getCallerUserProfile' : IDL.Func([], [IDL.Opt(UserProfile)], ['query']),
    'getSummaryDashboard' : IDL.Func([], [BalanceSummary], ['query']),
    'getTransactionHistory' : IDL.Func(
        [IDL.Int],
        [IDL.Vec(LedgerEntry)],
        ['query'],
      ),
    'saveCallerUserProfile' : IDL.Func([UserProfile], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
