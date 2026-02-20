/**
 * Client Portal Components
 *
 * PURE UI LAYER:
 * - All components read from PlanningStateService
 * - Create sessions via BookingFlowController
 * - NO business logic, NO automation
 */

export { default as ClientDashboard } from './ClientDashboard';
export { default as ClientSessionCard } from './ClientSessionCard';
export { default as ClientCreateSessionForm } from './ClientCreateSessionForm';
export { default as ClientEmptyState } from './ClientEmptyState';
