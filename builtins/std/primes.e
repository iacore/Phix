-- (c) Copyright - See License.txt
--
--/*
namespace primes
--*/

--****
-- == Prime Numbers
-- **Page Contents**
--
-- <<LEVELTOC depth=2>>

include std/search.e

sequence list_of_primes  = {2,3} -- Initial seedings.

--****
-- === Routines
--

--**
-- Returns all the prime numbers below some threshold, with a cap on computation time.
--
-- Parameters:
--      # ##max_p## : an integer, the last prime returned is the next prime after or on this value.
--      # ##time_out_p## : an atom, the maximum number of seconds that this function can run for.
--                        The default is 10 (ten) seconds.
--
-- Returns:
--      A **sequence**, made of prime numbers in increasing order. The last value is 
--      the next prime number that falls on or after the value of ##max_p##.
--
-- Comments:
-- * The returned sequence contains all the prime numbers less than its last element.
--
-- * If the function times out, it may not hold all primes below ##max_p##,
-- but only the largest ones will be absent. If the last element returned is 
-- less than ##max_p## then the function timed out.
--
-- * To disable the timeout, simply give it a negative value.
--
-- Example 1:
-- <eucode>
-- ? calc_primes(1000, 5)
-- -- On a very slow computer, you may only get all primes up to say 719. 
-- -- On a faster computer, the last element printed out will be 997. 
-- -- This call will never take longer than 5 seconds.
-- </eucode>
--
-- See Also:
--      [[:next_prime]] [[:prime_list]]
public function calc_primes(integer max_p, atom time_limit_p = 10)
sequence result_
integer candidate_
integer pos_
atom time_out_
integer maxp_
integer maxf_
integer maxf_idx
integer next_trigger
--/**/ integer skip

    -- First we check to see if we have already got the requested value.    
    if max_p<=list_of_primes[$] then
        pos_ = binary_search(max_p, list_of_primes)
        if pos_<0 then
            pos_ = (-pos_)+1
        end if
        -- Already got it.
        return list_of_primes[1..pos_]
    end if

    -- Record the largest known prime (so far) and its index.
    pos_ = length(list_of_primes)
    candidate_ = list_of_primes[$]

    -- Calculate the largest possible factor for the largest known prime, and its index.
    maxf_ = floor(power(candidate_, 0.5))
    maxf_idx = binary_search(maxf_, list_of_primes)
    if maxf_idx<0 then
        maxf_idx = (-maxf_idx)
        maxf_ = list_of_primes[maxf_idx]
    end if
    -- Calculate what the trigger is for when we need to go to the next maximum factor value.
    next_trigger = list_of_primes[maxf_idx+1]
    next_trigger *= next_trigger

    -- Pre-allocate space for the new values. This allocates more than we will
    -- need so the return value takes a slice up to the last stored prime.
    result_ = list_of_primes & repeat(0, floor(max_p/3.5)-length(list_of_primes))

    -- Calculate when we must stop running. A negative value is really equivalent
    -- to a little over three years from now.
    if time_limit_p<0 then
        time_out_ = time()+100_000_000
    else
        time_out_ = time()+time_limit_p
    end if

--/**/skip = 0
--/**/while time_out_>=time() do
--/*
    while time_out_ >= time()  label "MW" do
        -- As this could run for a significant amount of time,
        -- yield to any other tasks that might be ready.
        task_yield()
--*/

        -- Get the next candidate value to examine.     
        candidate_ += 2

        -- If this is at or past the factor trigger point
        -- pluck out the next maximum factor and calculate
        -- the next trigger.
        if candidate_>=next_trigger then
            maxf_idx += 1
            maxf_ = result_[maxf_idx]
            next_trigger = result_[maxf_idx+1]
            next_trigger *= next_trigger
        end if

        -- Examine the candidate.
        for i=2 to pos_ do
            -- If this potential factor is larger than the 'maximum' factor
            -- then we don't need to examine any more. The candidate is a prime.
            maxp_ = result_[i]
            if maxp_>maxf_ then
                exit
            end if

            -- If it is divisible by any known prime then
            -- we go get another candidate value.
            if remainder(candidate_, maxp_)=0 then
--/**/          skip = 1 exit       --/*
                continue "MW"       --*/
            end if
        end for
--/**/  if skip then skip = 0 else

            -- Store it in the result, making sure that the result sequence is larger enough.
            pos_ += 1
            if pos_>=length(result_) then
                result_ &= repeat(0, 1000)
            end if
            result_[pos_] = candidate_

            -- If the value just stored is larger or equal to the requested value
            -- then we can stop running.
            if candidate_>=max_p then
                exit
            end if
--/**/  end if
    end while

    return result_[1..pos_]
end function


--**
-- Return the next prime number on or after the supplied number
--
-- Parameters:
--      # ##n## : an integer, the starting point for the search
--      # ##fail_signal_p## : an integer, used to signal error. Defaults to -1.
--
-- Returns:
--      An **integer**, which is prime only if it took less than 1 second 
--      to determine the next prime greater or equal to ##n##.
--
-- Comments:
-- The default value of -1 will alert you about an invalid returned value,
-- since a prime not less than ##n## is expected. However, you can pass
-- another value for this parameter.
--
-- Example 1:
-- <eucode>
-- ? next_prime(997)
-- -- On a very slow computer, you might get -997, but 1003 is expected.
-- </eucode>
--
-- See Also:
-- [[:calc_primes]]

public function next_prime(integer n, object fail_signal_p = -1, atom time_out_p = 1)
integer i

    if n<0 then
        return fail_signal_p
    end if
    if list_of_primes[$]<n then
        list_of_primes = calc_primes(n,time_out_p)
    end if
    if n>list_of_primes[$] then
        return fail_signal_p
    end if
--  -- Assumes that most searches will be less than about 1000
--  if n<1009 and 1009<=list_of_primes[$] then
--      i = binary_search(n, list_of_primes, 1 ,169)
--  else
        i = binary_search(n, list_of_primes)
--  end if
    if i<0 then
        i = (-i)
    end if
    return list_of_primes[i]

end function

--**
-- Returns a list of prime numbers.
--
-- Parameters:
--      # ##top_prime_p## : The list will end with the prime less than or equal
--        to this value. If this is zero, the current list calculated primes
--        is returned.
--
-- Returns:
--      An **sequence**, a list of prime numbers from 2 to ##top_prime_p##
--
-- Example 1:
-- <eucode>
-- sequence pList = prime_list(1000)
-- -- pList will now contain all the primes from 2 up to the largest less than or
-- --    equal to 1000.
-- </eucode>
--
-- See Also:
-- [[:calc_primes]], [[:next_prime]]
--
public function prime_list(integer top_prime_p = 0)
integer index_

    if top_prime_p<=0 then
        return list_of_primes
    end if

    if list_of_primes[$]<top_prime_p then
        list_of_primes = calc_primes(top_prime_p, 5)
    end if

    index_ = binary_search(top_prime_p, list_of_primes)
    if index_<0 then
        index_ = -index_
    end if

    return list_of_primes[1..index_]
end function
