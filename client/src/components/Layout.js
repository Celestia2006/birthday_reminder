import React from 'react';
import { Link } from 'react-router-dom';

const Layout = ({ todaysBirthdays, upcomingBirthdays, nextBirthday, isEmpty }) => {
  if (isEmpty) {
    return (
      <div className="app-container">
        <div className="empty-state-message">
          <h2>Welcome to Birthday Tracker!</h2>
          <p>Add Birthdays to get started!</p>
          <Link to="/add-birthday" className="styled-button">
            Add Your First Birthday
          </Link>
        </div>
      </div>
    );
  }

   return (
     <div className="app-container">
       <div className="panel left-panel">
         <h2>
           {todaysBirthdays.length > 0 ? "Today's Birthdays" : "Next Birthday"}
         </h2>
         <div className="panel-content">
           {todaysBirthdays.length > 0 ? (
             todaysBirthdays.map((person) => (
               <div key={person.id} className="birthday-card">
                 <img
                   src={person.photo || "/images/default.jpg"}
                   alt={person.name}
                   className="birthday-image"
                   onError={(e) => {
                     e.target.onerror = null;
                     e.target.src = "/images/default.jpg";
                   }}
                 />
                 <h3>{person.message}</h3>
                 <p className="age-message">
                   Turning {person.turningAge} today!
                 </p>
                 <div className="birthday-details">
                   <p>
                     <strong>Nickname:</strong> {person.nickname}
                   </p>
                   <p>
                     <strong>Zodiac:</strong> {person.zodiac}
                   </p>
                   <p>
                     <strong>Gift Ideas:</strong> {person.giftIdeas}
                   </p>
                 </div>
                 <Link
                   to={`/birthday/${person.id}`}
                   className="styled-button view-details-button"
                 >
                   View Full Details
                 </Link>
               </div>
             ))
           ) : nextBirthday ? (
             <div className="birthday-card">
               <img
                 src={nextBirthday.photo || "/images/default.jpg"}
                 alt={nextBirthday.name}
                 className="birthday-image"
                 onError={(e) => {
                   e.target.onerror = null;
                   e.target.src = "/images/default.jpg";
                 }}
               />
               <h3>Next Up: {nextBirthday.name}</h3>
               <p className="age-message">
                 Birthday on{" "}
                 {new Date(nextBirthday.date).toLocaleDateString("en-US", {
                   month: "long",
                   day: "numeric",
                 })}
               </p>
               <div className="birthday-details">
                 <p>
                   <strong>Nickname:</strong> {nextBirthday.nickname}
                 </p>
                 <p>
                   <strong>Zodiac:</strong> {nextBirthday.zodiac}
                 </p>
                 <p>
                   <strong>Days until birthday:</strong>{" "}
                   {nextBirthday.daysUntil}
                 </p>
               </div>
               <Link
                 to={`/birthday/${nextBirthday.id}`}
                 className="styled-button view-details-button"
               >
                 View Full Details
               </Link>
             </div>
           ) : (
             <p>No upcoming birthdays</p>
           )}
         </div>
       </div>

       <div className="panel right-panel">
         <h2>Upcoming Birthdays</h2>
         <div className="panel-content">
           {upcomingBirthdays.length > 0 ? (
             <ul className="upcoming-list">
               {upcomingBirthdays.map((person) => (
                 <li key={person.id} className="upcoming-item">
                   <Link
                     to={`/birthday/${person.id}`}
                     className="upcoming-link"
                   >
                     <div className="upcoming-image-container">
                       <img
                         src={person.photo || "/images/default.jpg"}
                         alt={person.name}
                         onError={(e) => {
                           e.target.onerror = null;
                           e.target.src = "/images/default.jpg";
                         }}
                       />
                     </div>
                     <div className="upcoming-details">
                       <h3 className="person-name">{person.name}</h3>
                       <p>
                         {new Date(person.date).toLocaleDateString("en-US", {
                           month: "short",
                           day: "numeric",
                         })}
                       </p>
                       <p className="nickname">{person.nickname}</p>
                     </div>
                   </Link>
                 </li>
               ))}
             </ul>
           ) : (
             <p>No upcoming birthdays</p>
           )}
         </div>
       </div>
     </div>
   );
};



export default Layout;