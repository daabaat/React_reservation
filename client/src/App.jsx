import { useState, useEffect } from "react";
import Calendar from "react-calendar/dist/cjs/Calendar.js";
import "react-calendar/dist/Calendar.css";

import "./App.css";

function App() {
  const [reservations, setReservations] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateId, setUpdateId] = useState(null);
  const [accommodations, setAccommodations] = useState([]);
  const [users, setUsers] = useState([]);

  const fetchAccommodations = async () => {
    const response = await fetch("http://localhost:8080/accommodations");
    const data = await response.json();
    setAccommodations(data);
    console.log(data);
  };

  useEffect(() => {
    fetchAccommodations();
  }, []);

  const fetchUsers = async () => {
    const response = await fetch("http://localhost:8080/users");
    const data = await response.json();
    setUsers(data);
    console.log(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchData = async () => {
    try {
      const reservationsResponse = await fetch(
        "http://localhost:8080/reservations"
      );
      if (!reservationsResponse.ok) {
        throw new Error("Network response was not ok");
      }
      const reservationsData = await reservationsResponse.json();
      setReservations(reservationsData);

      const timeSlotsResponse = await fetch("http://localhost:8080/timeslots");
      if (!timeSlotsResponse.ok) {
        throw new Error("Network response was not ok");
      }
      const timeSlotsData = await timeSlotsResponse.json();
      setTimeSlots(timeSlotsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:8080/reservations/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            startDate: checkin,
            endDate: checkout,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "예약 생성에 실패했습니다.");
      }

      await fetchData();
      setCheckin("");
      setCheckout("");
      alert("예약이 성공적으로 생성되었습니다.");
    } catch (error) {
      console.error("Error creating reservation:", error);
      alert(error.message);
    }
  };

  const tileDisabled = ({ date }) => {
    try {
      const koreaDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
      const formattedDate = koreaDate.toISOString().split("T")[0];

      const timeSlot = timeSlots.find((slot) => {
        const slotDate = new Date(slot.date);
        const koreaSlotDate = new Date(slotDate.getTime() + 9 * 60 * 60 * 1000);
        return koreaSlotDate.toISOString().split("T")[0] === formattedDate;
      });

      if (!timeSlot) return false;
      return timeSlot.am.isReserved && timeSlot.pm.isReserved;
    } catch (error) {
      console.error("Error in tileDisabled:", error);
      return false;
    }
  };

  const tileClassName = ({ date }) => {
    try {
      const koreaDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
      const formattedDate = koreaDate.toISOString().split("T")[0];

      const timeSlot = timeSlots.find((slot) => {
        const slotDate = new Date(slot.date);
        const koreaSlotDate = new Date(slotDate.getTime() + 9 * 60 * 60 * 1000);
        return koreaSlotDate.toISOString().split("T")[0] === formattedDate;
      });

      if (!timeSlot) return "";

      if (timeSlot.am.isReserved && timeSlot.pm.isReserved)
        return "fully-reserved";
      if (timeSlot.am.isReserved) return "am-reserved";
      if (timeSlot.pm.isReserved) return "pm-reserved";

      return "";
    } catch (error) {
      console.error("Error in tileClassName:", error);
      return "";
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("예약을 삭제하시겠습니까?");
    if (confirmDelete) {
      try {
        const response = await fetch(
          `http://localhost:8080/reservations/delete/${id}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("예약 삭제에 실패했습니다.");
        }

        // TimeSlot 데이터를 먼저 업데이트
        const timeSlotsResponse = await fetch(
          "http://localhost:8080/timeslots"
        );
        if (!timeSlotsResponse.ok) {
          throw new Error("TimeSlot 데이터를 가져오는데 실패했습니다.");
        }
        const timeSlotsData = await timeSlotsResponse.json();
        setTimeSlots(timeSlotsData);

        // 예약 데이터도 업데이트
        const reservationsResponse = await fetch(
          "http://localhost:8080/reservations"
        );
        if (!reservationsResponse.ok) {
          throw new Error("예약 데이터를 가져오는데 실패했습니다.");
        }
        const reservationsData = await reservationsResponse.json();
        setReservations(reservationsData);

        alert("예약이 삭제되었습니다.");
      } catch (error) {
        console.error("Error deleting reservation:", error);
        alert(error.message);
      }
    }
  };

  const handleUpdate = (id) => {
    const reservationToUpdate = reservations.find(
      (reservation) => reservation._id === id
    );

    const startDate = new Date(reservationToUpdate.startDate);
    const endDate = new Date(reservationToUpdate.endDate);

    const koreaStartDate = new Date(startDate.getTime() + 9 * 60 * 60 * 1000);
    const koreaEndDate = new Date(endDate.getTime() + 9 * 60 * 60 * 1000);

    setCheckin(koreaStartDate.toISOString().split("T")[0]);
    setCheckout(koreaEndDate.toISOString().split("T")[0]);
    setUpdateId(id);
    setIsUpdating(true);
  };

  const handleDateChange = (date, isCheckIn = true) => {
    try {
      const koreaDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
      const formattedDate = koreaDate.toISOString().split("T")[0];

      if (isCheckIn) {
        setCheckin(formattedDate);
        console.log("체크인 날짜:", formattedDate);
      } else {
        setCheckout(formattedDate);
        console.log("체크아웃 날짜:", formattedDate);
      }
    } catch (error) {
      console.error("Error in handleDateChange:", error);
    }
  };

  const handleConfirmUpdate = async () => {
    const confirmUpdate = window.confirm("해당 날짜로 수정하시겠습니까?");
    if (confirmUpdate) {
      try {
        const response = await fetch(
          `http://localhost:8080/reservations/update/${updateId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              startDate: checkin,
              endDate: checkout,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message);
        }

        await fetchData();
        setIsUpdating(false);
        setUpdateId(null);
        setCheckin("");
        setCheckout("");
        alert("예약이 수정되었습니다.");
      } catch (error) {
        console.error("Error updating reservation:", error);
        alert(error.message);
      }
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          type="date"
          value={checkin}
          onChange={(e) => setCheckin(e.target.value)}
          required
        />
        <input
          type="date"
          value={checkout}
          onChange={(e) => setCheckout(e.target.value)}
          required
        />
        <button type="submit">예약하기</button>
      </form>
      <Calendar tileDisabled={tileDisabled} tileClassName={tileClassName} />
      {isUpdating && (
        <div>
          <h3>체크인 날짜를 선택해주세요</h3>
          <Calendar
            onChange={(date) => handleDateChange(date, true)}
            value={checkin ? new Date(checkin) : null}
          />
          <div>
            <h4>체크아웃 날짜 선택</h4>
            <Calendar
              onChange={(date) => handleDateChange(date, false)}
              value={checkout ? new Date(checkout) : null}
              minDate={checkin ? new Date(checkin) : null} // 체크인 날짜 이후만 선택 가능
            />
          </div>
          {checkin && checkout && (
            <button onClick={handleConfirmUpdate}>수정하기</button>
          )}
        </div>
      )}
      <ul>
        {reservations.map((reservation) => (
          <li key={reservation._id}>
            체크인: {new Date(reservation.startDate).toLocaleDateString()} PM ~
            체크아웃: {new Date(reservation.endDate).toLocaleDateString()} AM
            <button onClick={() => handleDelete(reservation._id)}>
              삭제하기
            </button>
            <button onClick={() => handleUpdate(reservation._id)}>
              수정하기
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

export default App;
