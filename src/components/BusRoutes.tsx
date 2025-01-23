import { useEffect, useState } from "react";
import { getDepos } from "../services/api";

const BusRoutes = ({ route, onRouteChange }) => {
  return (
    <div className="">
      <div className="flex flex-col gap-4 p-4 bg-white w-full items-start rounded-lg border">
        <h1 className="text-lg font-bold">Create Route</h1>
        <div className="flex flex-row-reverse gap-1">
          <label className="text-sm text-neutral-900" htmlFor="">
            Split Route Number
          </label>
          <input
            type="checkbox"
            name="splitRoute"
            onChange={onRouteChange}
            className=""
            required
          />
        </div>
        <div className="grid md:grid-cols-4 sm:grid-cols-1  w-full gap-4 ">
          {!route.splitRoute && (
            <div className="flex flex-col gap-1">
              <label className="text-sm text-neutral-900" htmlFor="">
                Route Number
              </label>
              <input
                type="text"
                name="routeNumber"
                maxLength={7}
                value={route.routeNumber}
                onChange={onRouteChange}
                className="form-input w-full px-3 py-2 rounded-md border-neutral-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
                required
              />
            </div>
          )}

          {route.splitRoute && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-neutral-900" htmlFor="">
                  Route Number Upper Half
                </label>
                <input
                  type="text"
                  name="routeNumberUpperHalf"
                  value={route.routeNumberUpperHalf}
                  onChange={onRouteChange}
                  maxLength={4}
                  className="form-input w-full px-3 py-2 rounded-md border-neutral-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-neutral-900" htmlFor="">
                  Route Number Lower Half
                </label>
                <input
                  type="text"
                  name="routeNumberLowerHalf"
                  value={route.routeNumberLowerHalf}
                  onChange={onRouteChange}
                  maxLength={4}
                  className="form-input w-full px-3 py-2 rounded-md border-neutral-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>
            </>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-sm text-neutral-900" htmlFor="">
              Source
            </label>
            <input
              type="text"
              name="source"
              value={route.source}
              onChange={onRouteChange}
              className="form-input w-full px-3 py-2 rounded-md border-neutral-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-neutral-900" htmlFor="">
              Destination
            </label>
            <input
              type="text"
              name="destination"
              value={route.destination}
              onChange={onRouteChange}
              className="form-input w-full px-3 py-2 rounded-md border-neutral-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-neutral-900" htmlFor="">
              separation
            </label>
            <select
              type="text"
              name="separation"
              value={route.separation}
              onChange={onRouteChange}
              className="form-input w-full px-3 py-2 rounded-md border-neutral-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
              required
            >
              <option value="-">-</option>
              <option value="TO">TO</option>
              <option value="VICE-VERSA">VICE-VERSA</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-neutral-900" htmlFor="">
              Via
            </label>
            <input
              type="text"
              name="via"
              value={route.via}
              onChange={onRouteChange}
              className="form-input w-full px-3 py-2 rounded-md border-neutral-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusRoutes;
