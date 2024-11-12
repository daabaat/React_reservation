import { useState, useEffect } from "react";
import Calendar from "react-calendar/dist/cjs/Calendar.js";
import "react-calendar/dist/Calendar.css";

import "./App.css";

function App() {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/reservations");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setReservations(data);
      } catch (error) {
        console.error("Error fetching reservations:", error);
      }
    };

    fetchReservations();
  }, []);

  const tileDisabled = ({ date }) => {
    return reservations.some((reservation) => {
      const checkinDate = new Date(reservation.checkin);
      return (
        date.getDate() === checkinDate.getDate() &&
        date.getMonth() === checkinDate.getMonth() &&
        date.getFullYear() === checkinDate.getFullYear()
      );
    });
  };

  const tileClassName = ({ date }) => {
    const isCheckoutDate = reservations.some((reservation) => {
      const checkoutDate = new Date(reservation.checkout);
      return (
        date.getDate() === checkoutDate.getDate() &&
        date.getMonth() === checkoutDate.getMonth() &&
        date.getFullYear() === checkoutDate.getFullYear()
      );
    });

    return isCheckoutDate ? "checkout-date" : "";
  };

  return (
    <>
      <Calendar tileDisabled={tileDisabled} tileClassName={tileClassName} />
      <ul>
        {reservations.map((reservation, index) => (
          <li key={index}>
            Check-in: {new Date(reservation.checkin).toLocaleString()} -
            Check-out: {new Date(reservation.checkout).toLocaleString()}
          </li>
        ))}
      </ul>
    </>
  );
}

export default App;
