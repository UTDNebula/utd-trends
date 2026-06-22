/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import SingleProfInfo from '@/components/common/SingleProfInfo/SingleProfInfo';
import { render, screen } from '@testing-library/react';
import { mockRMP, mockRmpNoRatings } from '../mocks/RMP.mocks';
import { mockSearchQuery } from '../mocks/SearchQuery.mocks';

describe('SingleProfInfo', () => {
  it('displays average rating', () => {
    render(<SingleProfInfo open={false} rmp={mockRMP} searchQuery={mockSearchQuery} />);

    // displays average rating
    const rating = screen.getByText(mockRMP.avgRating.toFixed(1));

    expect(rating).toBeInTheDocument();
  });

  it('displays N/A given no ratings', () => {
    render(
      <SingleProfInfo open={false} rmp={mockRmpNoRatings} searchQuery={mockSearchQuery} />,
    );

    // displays average rating
    const rating = screen.getByText('N/A');

    expect(rating).toBeInTheDocument();
  });
});
