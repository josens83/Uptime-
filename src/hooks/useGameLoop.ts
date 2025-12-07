import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { generateTicket } from '../data/tickets';
import { getRandomEvent } from '../data/events';

const BASE_TICK_INTERVAL = 1000; // 1 second = 1 game hour
const BASE_TICKET_INTERVAL = 15000; // Generate ticket every 15 seconds
const BASE_EVENT_INTERVAL = 60000; // Random event every 60 seconds
const TICKET_UPDATE_INTERVAL = 1000; // Update ticket timers every second

export function useGameLoop() {
  const {
    isPaused,
    gameSpeed,
    phase,
    day,
    techDebt,
    tickets,
    gameTick,
    addTicket,
    updateTicketTimers,
    triggerEvent,
    user
  } = useGameStore();

  const gameTickRef = useRef<NodeJS.Timeout | null>(null);
  const ticketTickRef = useRef<NodeJS.Timeout | null>(null);
  const eventTickRef = useRef<NodeJS.Timeout | null>(null);
  const ticketTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearAllIntervals = useCallback(() => {
    if (gameTickRef.current) {
      clearInterval(gameTickRef.current);
      gameTickRef.current = null;
    }
    if (ticketTickRef.current) {
      clearInterval(ticketTickRef.current);
      ticketTickRef.current = null;
    }
    if (eventTickRef.current) {
      clearInterval(eventTickRef.current);
      eventTickRef.current = null;
    }
    if (ticketTimerRef.current) {
      clearInterval(ticketTimerRef.current);
      ticketTimerRef.current = null;
    }
  }, []);

  // Main game loop
  useEffect(() => {
    if (isPaused) {
      clearAllIntervals();
      return;
    }

    const tickInterval = BASE_TICK_INTERVAL / gameSpeed;

    gameTickRef.current = setInterval(() => {
      gameTick();
    }, tickInterval);

    return () => {
      if (gameTickRef.current) {
        clearInterval(gameTickRef.current);
      }
    };
  }, [isPaused, gameSpeed, gameTick, clearAllIntervals]);

  // Ticket generation loop
  useEffect(() => {
    if (isPaused) return;

    const ticketInterval = BASE_TICKET_INTERVAL / gameSpeed;

    // Generate initial ticket if none exist
    if (tickets.length === 0) {
      const newTicket = generateTicket(techDebt, day, phase);
      addTicket(newTicket);
    }

    ticketTickRef.current = setInterval(() => {
      // Limit max tickets based on team size
      const maxTickets = 3 + Math.floor(useGameStore.getState().team.developers / 2);

      if (useGameStore.getState().tickets.length < maxTickets) {
        const state = useGameStore.getState();
        const newTicket = generateTicket(state.techDebt, state.day, state.phase);
        addTicket(newTicket);
      }
    }, ticketInterval);

    return () => {
      if (ticketTickRef.current) {
        clearInterval(ticketTickRef.current);
      }
    };
  }, [isPaused, gameSpeed, phase, day, techDebt, addTicket, tickets.length]);

  // Ticket timer update loop
  useEffect(() => {
    if (isPaused) return;

    ticketTimerRef.current = setInterval(() => {
      updateTicketTimers();
    }, TICKET_UPDATE_INTERVAL / gameSpeed);

    return () => {
      if (ticketTimerRef.current) {
        clearInterval(ticketTimerRef.current);
      }
    };
  }, [isPaused, gameSpeed, updateTicketTimers]);

  // Random event loop
  useEffect(() => {
    if (isPaused) return;

    const eventInterval = BASE_EVENT_INTERVAL / gameSpeed;

    eventTickRef.current = setInterval(() => {
      // 10% chance per interval
      if (Math.random() < 0.1) {
        const state = useGameStore.getState();
        const isPremium = state.user?.subscription !== 'free';
        const event = getRandomEvent(state.phase, state.day, isPremium);

        if (event) {
          triggerEvent(event);
        }
      }
    }, eventInterval);

    return () => {
      if (eventTickRef.current) {
        clearInterval(eventTickRef.current);
      }
    };
  }, [isPaused, gameSpeed, triggerEvent]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllIntervals();
    };
  }, [clearAllIntervals]);

  return {
    isPaused,
    gameSpeed
  };
}

// Hook for just the ticket timers (optimized for display updates)
export function useTicketTimers() {
  const tickets = useGameStore(state => state.tickets);
  const isPaused = useGameStore(state => state.isPaused);

  return { tickets, isPaused };
}

// Hook for game stats (optimized for stats display)
export function useGameStats() {
  const uptime = useGameStore(state => state.uptime);
  const money = useGameStore(state => state.money);
  const users = useGameStore(state => state.users);
  const reputation = useGameStore(state => state.reputation);
  const day = useGameStore(state => state.day);
  const hour = useGameStore(state => state.hour);
  const phase = useGameStore(state => state.phase);
  const techDebt = useGameStore(state => state.techDebt);

  return { uptime, money, users, reputation, day, hour, phase, techDebt };
}

// Hook for computed values
export function useGameComputed() {
  const getServerCapacity = useGameStore(state => state.getServerCapacity);
  const getServerCost = useGameStore(state => state.getServerCost);
  const getTeamSalary = useGameStore(state => state.getTeamSalary);
  const getRevenuePerHour = useGameStore(state => state.getRevenuePerHour);

  return {
    serverCapacity: getServerCapacity(),
    serverCost: getServerCost(),
    teamSalary: getTeamSalary(),
    revenuePerHour: getRevenuePerHour()
  };
}
