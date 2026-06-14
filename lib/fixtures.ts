import { Fixture, Team } from './types';

const mkTeam = (name: string, code: string, flag: string, group: string): Team => ({ name, code, flag, group });

// WC 2026 - 48 teams across 12 groups (A-L), 3 teams per group → 3 matches per group = 36 group matches
// Then 32 knockout (R32). Total 104 matches. We store group stage here.
export const TEAMS: Record<string, Team> = {
  // Group A
  USA: mkTeam('United States', 'US', '🇺🇸', 'A'),
  CAN: mkTeam('Canada', 'CA', '🇨🇦', 'A'),
  MEX: mkTeam('Mexico', 'MX', '🇲🇽', 'A'),
  URU: mkTeam('Uruguay', 'UY', '🇺🇾', 'A'),
  // Group B
  ARG: mkTeam('Argentina', 'AR', '🇦🇷', 'B'),
  MAR: mkTeam('Morocco', 'MA', '🇲🇦', 'B'),
  POR: mkTeam('Portugal', 'PT', '🇵🇹', 'B'),
  ANG: mkTeam('Angola', 'AO', '🇦🇴', 'B'),
  // Group C
  ESP: mkTeam('Spain', 'ES', '🇪🇸', 'C'),
  BRA: mkTeam('Brazil', 'BR', '🇧🇷', 'C'),
  JPN: mkTeam('Japan', 'JP', '🇯🇵', 'C'),
  QAT: mkTeam('Qatar', 'QA', '🇶🇦', 'C'),
  // Group D
  FRA: mkTeam('France', 'FR', '🇫🇷', 'D'),
  ENG: mkTeam('England', 'GB-ENG', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'D'),
  SEN: mkTeam('Senegal', 'SN', '🇸🇳', 'D'),
  ECU: mkTeam('Ecuador', 'EC', '🇪🇨', 'D'),
  // Group E
  GER: mkTeam('Germany', 'DE', '🇩🇪', 'E'),
  NED: mkTeam('Netherlands', 'NL', '🇳🇱', 'E'),
  MEX2: mkTeam('Mexico', 'MX', '🇲🇽', 'E'),
  CIV: mkTeam('Côte d\'Ivoire', 'CI', '🇨🇮', 'E'),
  // Group F
  BEL: mkTeam('Belgium', 'BE', '🇧🇪', 'F'),
  COL: mkTeam('Colombia', 'CO', '🇨🇴', 'F'),
  AUS: mkTeam('Australia', 'AU', '🇦🇺', 'F'),
  KSA: mkTeam('Saudi Arabia', 'SA', '🇸🇦', 'F'),
  // Group G
  POR2: mkTeam('Portugal', 'PT', '🇵🇹', 'G'),
  CRO: mkTeam('Croatia', 'HR', '🇭🇷', 'G'),
  TUR: mkTeam('Turkey', 'TR', '🇹🇷', 'G'),
  CHI: mkTeam('Chile', 'CL', '🇨🇱', 'G'),
  // Group H
  ITA: mkTeam('Italy', 'IT', '🇮🇹', 'H'),
  DEN: mkTeam('Denmark', 'DK', '🇩🇰', 'H'),
  MEX3: mkTeam('Mexico', 'MX', '🇲🇽', 'H'),
  ALG: mkTeam('Algeria', 'DZ', '🇩🇿', 'H'),
  // Group I
  NGA: mkTeam('Nigeria', 'NG', '🇳🇬', 'I'),
  POL: mkTeam('Poland', 'PL', '🇵🇱', 'I'),
  EGY: mkTeam('Egypt', 'EG', '🇪🇬', 'I'),
  NZL: mkTeam('New Zealand', 'NZ', '🇳🇿', 'I'),
  // Group J
  KOR: mkTeam('South Korea', 'KR', '🇰🇷', 'J'),
  IRN: mkTeam('Iran', 'IR', '🇮🇷', 'J'),
  GHA: mkTeam('Ghana', 'GH', '🇬🇭', 'J'),
  PAR: mkTeam('Paraguay', 'PY', '🇵🇾', 'J'),
  // Group K
  SRB: mkTeam('Serbia', 'RS', '🇷🇸', 'K'),
  SUI: mkTeam('Switzerland', 'CH', '🇨🇭', 'K'),
  CMR: mkTeam('Cameroon', 'CM', '🇨🇲', 'K'),
  VEN: mkTeam('Venezuela', 'VE', '🇻🇪', 'K'),
  // Group L
  UKR: mkTeam('Ukraine', 'UA', '🇺🇦', 'L'),
  MEX4: mkTeam('Mexico', 'MX', '🇲🇽', 'L'),
  ROM: mkTeam('Romania', 'RO', '🇷🇴', 'L'),
  TRI: mkTeam('Trinidad & Tobago', 'TT', '🇹🇹', 'L'),
};

// Simplified: each group has 4 teams, plays 6 matches (round robin)
// WC 2026 group stage: 12 groups × 4 teams × 6 matches = 72 matches total
const groupFixtures = (
  id_prefix: string,
  group: string,
  t1: Team, t2: Team, t3: Team, t4: Team,
  d1: string, d2: string, d3: string, d4: string, d5: string, d6: string
): Fixture[] => [
  { id: `${id_prefix}-1`, homeTeam: t1, awayTeam: t2, date: d1, venue: 'TBD', stage: 'Group', group },
  { id: `${id_prefix}-2`, homeTeam: t3, awayTeam: t4, date: d2, venue: 'TBD', stage: 'Group', group },
  { id: `${id_prefix}-3`, homeTeam: t1, awayTeam: t3, date: d3, venue: 'TBD', stage: 'Group', group },
  { id: `${id_prefix}-4`, homeTeam: t2, awayTeam: t4, date: d4, venue: 'TBD', stage: 'Group', group },
  { id: `${id_prefix}-5`, homeTeam: t1, awayTeam: t4, date: d5, venue: 'TBD', stage: 'Group', group },
  { id: `${id_prefix}-6`, homeTeam: t2, awayTeam: t3, date: d6, venue: 'TBD', stage: 'Group', group },
];

const T = TEAMS;

export const GROUP_FIXTURES: Fixture[] = [
  ...groupFixtures('A', 'A', T.USA, T.CAN, T.MEX, T.URU,
    '2026-06-11T19:00:00Z', '2026-06-12T22:00:00Z',
    '2026-06-15T22:00:00Z', '2026-06-16T01:00:00Z',
    '2026-06-19T22:00:00Z', '2026-06-19T22:00:00Z'),

  ...groupFixtures('B', 'B', T.ARG, T.MAR, T.POR, T.ANG,
    '2026-06-12T01:00:00Z', '2026-06-12T19:00:00Z',
    '2026-06-16T19:00:00Z', '2026-06-16T22:00:00Z',
    '2026-06-20T22:00:00Z', '2026-06-20T22:00:00Z'),

  ...groupFixtures('C', 'C', T.ESP, T.BRA, T.JPN, T.QAT,
    '2026-06-13T01:00:00Z', '2026-06-13T19:00:00Z',
    '2026-06-17T01:00:00Z', '2026-06-17T19:00:00Z',
    '2026-06-21T22:00:00Z', '2026-06-21T22:00:00Z'),

  ...groupFixtures('D', 'D', T.FRA, T.ENG, T.SEN, T.ECU,
    '2026-06-13T22:00:00Z', '2026-06-14T01:00:00Z',
    '2026-06-17T22:00:00Z', '2026-06-18T01:00:00Z',
    '2026-06-22T22:00:00Z', '2026-06-22T22:00:00Z'),

  ...groupFixtures('E', 'E', T.GER, T.NED, T.MEX2, T.CIV,
    '2026-06-14T19:00:00Z', '2026-06-14T22:00:00Z',
    '2026-06-18T19:00:00Z', '2026-06-18T22:00:00Z',
    '2026-06-23T22:00:00Z', '2026-06-23T22:00:00Z'),

  ...groupFixtures('F', 'F', T.BEL, T.COL, T.AUS, T.KSA,
    '2026-06-15T01:00:00Z', '2026-06-15T19:00:00Z',
    '2026-06-19T01:00:00Z', '2026-06-19T19:00:00Z',
    '2026-06-24T22:00:00Z', '2026-06-24T22:00:00Z'),

  ...groupFixtures('G', 'G', T.POR2, T.CRO, T.TUR, T.CHI,
    '2026-06-15T22:00:00Z', '2026-06-16T19:00:00Z',
    '2026-06-20T01:00:00Z', '2026-06-20T19:00:00Z',
    '2026-06-25T22:00:00Z', '2026-06-25T22:00:00Z'),

  ...groupFixtures('H', 'H', T.ITA, T.DEN, T.MEX3, T.ALG,
    '2026-06-16T22:00:00Z', '2026-06-17T22:00:00Z',
    '2026-06-21T01:00:00Z', '2026-06-21T19:00:00Z',
    '2026-06-26T22:00:00Z', '2026-06-26T22:00:00Z'),

  ...groupFixtures('I', 'I', T.NGA, T.POL, T.EGY, T.NZL,
    '2026-06-18T19:00:00Z', '2026-06-19T01:00:00Z',
    '2026-06-22T01:00:00Z', '2026-06-22T19:00:00Z',
    '2026-06-27T22:00:00Z', '2026-06-27T22:00:00Z'),

  ...groupFixtures('J', 'J', T.KOR, T.IRN, T.GHA, T.PAR,
    '2026-06-19T22:00:00Z', '2026-06-20T22:00:00Z',
    '2026-06-23T01:00:00Z', '2026-06-23T19:00:00Z',
    '2026-06-28T22:00:00Z', '2026-06-28T22:00:00Z'),

  ...groupFixtures('K', 'K', T.SRB, T.SUI, T.CMR, T.VEN,
    '2026-06-20T19:00:00Z', '2026-06-21T22:00:00Z',
    '2026-06-24T01:00:00Z', '2026-06-24T19:00:00Z',
    '2026-06-29T22:00:00Z', '2026-06-29T22:00:00Z'),

  ...groupFixtures('L', 'L', T.UKR, T.MEX4, T.ROM, T.TRI,
    '2026-06-21T01:00:00Z', '2026-06-22T22:00:00Z',
    '2026-06-25T01:00:00Z', '2026-06-25T19:00:00Z',
    '2026-06-30T22:00:00Z', '2026-06-30T22:00:00Z'),
];

export const ALL_FIXTURES: Fixture[] = GROUP_FIXTURES;

export function getFixtureById(id: string): Fixture | undefined {
  return ALL_FIXTURES.find(f => f.id === id);
}

export function getFixturesByGroup(group: string): Fixture[] {
  return GROUP_FIXTURES.filter(f => f.group === group);
}

export const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
