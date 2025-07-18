import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const TrendingContainer = styled.div`
  margin-top: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const Title = styled.h3`
  color: white;
  margin-bottom: 15px;
`;

const TrendingList = styled.ul`
  list-style: none;
  padding: 0;
`;

const TrendingItem = styled.li`
  color: white;
  margin-bottom: 10px;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const ButtonGroup = styled.div`
  margin-bottom: 15px;
`;

const Button = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 15px;
  margin-right: 10px;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  &.active {
    background: rgba(255, 255, 255, 0.4);
  }
`;

const Trending = ({ onTrendClick }) => {
  const [trends, setTrends] = useState([]);
  const [period, setPeriod] = useState('all');

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const response = await fetch(`http://localhost:6329/api/trending?period=${period}`);
        const data = await response.json();
        setTrends(data);
      } catch (error) {
        console.error('Failed to fetch trends:', error);
      }
    };

    fetchTrends();
  }, [period]);

  return (
    <TrendingContainer>
      <Title>Trending Searches</Title>
      <ButtonGroup>
        <Button onClick={() => setPeriod('today')} className={period === 'today' ? 'active' : ''}>Today</Button>
        <Button onClick={() => setPeriod('month')} className={period === 'month' ? 'active' : ''}>This Month</Button>
        <Button onClick={() => setPeriod('all')} className={period === 'all' ? 'active' : ''}>All Time</Button>
      </ButtonGroup>
      <TrendingList>
        {trends.map(([trend, count]) => (
          <TrendingItem key={trend} onClick={() => onTrendClick(trend)}>
            {trend}
          </TrendingItem>
        ))}
      </TrendingList>
    </TrendingContainer>
  );
};

export default Trending;