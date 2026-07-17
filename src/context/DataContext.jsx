import React, { createContext, useContext, useReducer, useCallback, useMemo } from "react";
import { PROPERTIES } from "../mocks/properties.js";
import { ROOMS } from "../mocks/rooms.js";
import { RATE_PLANS } from "../mocks/ratePlans.js";

const DataContext = createContext(null);

const initialState = {
  properties: PROPERTIES,
  rooms: ROOMS,
  ratePlans: RATE_PLANS,
};

function nextId(items, prefix, base) {
  const nums = items.map((i) => Number(i.id.split("-")[1]) || base);
  return `${prefix}-${Math.max(...nums, base) + 1}`;
}

function reducer(state, action) {
  switch (action.type) {
    case "ADD_PROPERTY":
      return { ...state, properties: [action.payload, ...state.properties] };
    case "UPDATE_PROPERTY":
      return {
        ...state,
        properties: state.properties.map((p) => (p.id === action.payload.id ? action.payload : p)),
      };
    case "DELETE_PROPERTY":
      return {
        ...state,
        properties: state.properties.filter((p) => p.id !== action.payload),
        rooms: state.rooms.filter((r) => r.propertyId !== action.payload),
      };
    case "ADD_ROOM":
      return { ...state, rooms: [action.payload, ...state.rooms] };
    case "UPDATE_ROOM":
      return { ...state, rooms: state.rooms.map((r) => (r.id === action.payload.id ? action.payload : r)) };
    case "DELETE_ROOM":
      return {
        ...state,
        rooms: state.rooms.filter((r) => r.id !== action.payload),
        ratePlans: state.ratePlans.filter((rp) => rp.roomId !== action.payload),
      };
    case "ADD_RATE_PLAN":
      return { ...state, ratePlans: [action.payload, ...state.ratePlans] };
    case "UPDATE_RATE_PLAN":
      return { ...state, ratePlans: state.ratePlans.map((rp) => (rp.id === action.payload.id ? action.payload : rp)) };
    case "DELETE_RATE_PLAN":
      return { ...state, ratePlans: state.ratePlans.filter((rp) => rp.id !== action.payload) };
    default:
      return state;
  }
}

export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const roomCountFor = useCallback((propertyId) => state.rooms.filter((r) => r.propertyId === propertyId).length, [state.rooms]);
  const ratePlanCountFor = useCallback(
    (propertyId) => {
      const roomIds = new Set(state.rooms.filter((r) => r.propertyId === propertyId).map((r) => r.id));
      return state.ratePlans.filter((rp) => roomIds.has(rp.roomId)).length;
    },
    [state.rooms, state.ratePlans]
  );

  const api = useMemo(
    () => ({
      ...state,
      roomCountFor,
      ratePlanCountFor,
      addProperty: (data) => {
        const property = { ...data, id: nextId(state.properties, "PROP", 1000) };
        dispatch({ type: "ADD_PROPERTY", payload: property });
        return property;
      },
      updateProperty: (property) => dispatch({ type: "UPDATE_PROPERTY", payload: property }),
      deleteProperty: (id) => dispatch({ type: "DELETE_PROPERTY", payload: id }),
      duplicateProperty: (property) => {
        const copy = { ...property, id: nextId(state.properties, "PROP", 1000), name: `${property.name} (Copy)` };
        dispatch({ type: "ADD_PROPERTY", payload: copy });
        return copy;
      },
      archiveProperty: (property) => dispatch({ type: "UPDATE_PROPERTY", payload: { ...property, status: "Archived" } }),

      addRoom: (data) => {
        const room = { ...data, id: nextId(state.rooms, "RM", 2000) };
        dispatch({ type: "ADD_ROOM", payload: room });
        return room;
      },
      updateRoom: (room) => dispatch({ type: "UPDATE_ROOM", payload: room }),
      deleteRoom: (id) => dispatch({ type: "DELETE_ROOM", payload: id }),

      addRatePlan: (data) => {
        const ratePlan = { ...data, id: nextId(state.ratePlans, "RP", 3000) };
        dispatch({ type: "ADD_RATE_PLAN", payload: ratePlan });
        return ratePlan;
      },
      updateRatePlan: (ratePlan) => dispatch({ type: "UPDATE_RATE_PLAN", payload: ratePlan }),
      deleteRatePlan: (id) => dispatch({ type: "DELETE_RATE_PLAN", payload: id }),
    }),
    [state, roomCountFor, ratePlanCountFor]
  );

  return <DataContext.Provider value={api}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
