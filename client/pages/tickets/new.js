import React, { useState } from 'react';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';
const NewTicket = () => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const { doRequest, errors } = useRequest({
    url: '/api/tickets',
    method: 'post',
    body: {
      title,
      price,
    },
    onSuccess: () => Router.push('/'),
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    doRequest();
  };

  const onPriceBlur = () => {
    const value = parseFloat(price);
    if (isNaN(value)) {
      return;
    }
    setPrice(value.toFixed(2));
  };
  return (
    <div>
      <h1>create a ticket</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-control"
            type="text"
            id="title"
          />
          <label htmlFor="price">Price</label>
          <input
            value={price}
            onBlur={onPriceBlur}
            onChange={(e) => setPrice(e.target.value)}
            className="form-control"
            type="text"
            id="price"
          />
        </div>
        {errors}
        <button className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
};

export default NewTicket;
